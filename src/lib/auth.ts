import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "./db";
import {
  isAccountLocked,
  shouldLockAccount,
  getLockoutEndTime,
  generateVerificationCode,
} from "./security";
import { sendEmail, emailTemplates } from "./email";

const MAX_LOGIN_ATTEMPTS = 5;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const email = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // Check if account is locked
        if (isAccountLocked(user.lockedUntil)) {
          const remainingMinutes = Math.ceil(
            (user.lockedUntil!.getTime() - Date.now()) / 60000
          );
          throw new Error(
            `Account locked. Try again in ${remainingMinutes} minutes.`
          );
        }

        // Check if email is verified
        if (!user.isActive) {
          throw new Error("Please verify your email before logging in.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          // Increment failed login attempts
          const newFailedAttempts = user.failedLoginAttempts + 1;
          const updateData: any = {
            failedLoginAttempts: newFailedAttempts,
          };

          // Lock account if too many failed attempts
          if (shouldLockAccount(newFailedAttempts)) {
            updateData.lockedUntil = getLockoutEndTime();
          }

          await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          });

          // Log failed attempt
          await prisma.loginHistory.create({
            data: {
              userId: user.id,
              ipAddress: req?.headers?.["x-forwarded-for"]?.toString() || null,
              userAgent: req?.headers?.["user-agent"]?.toString() || null,
              success: false,
              reason: "Invalid password",
            },
          });

          const remainingAttempts = MAX_LOGIN_ATTEMPTS - newFailedAttempts;
          if (remainingAttempts > 0) {
            throw new Error(
              `Invalid credentials. ${remainingAttempts} attempts remaining.`
            );
          } else {
            throw new Error("Account locked due to too many failed attempts.");
          }
        }

        // Check 2FA if enabled
        if (user.twoFactorEnabled) {
          if (!credentials.twoFactorCode) {
            // Generate and send 2FA code via email
            const code = generateVerificationCode();
            const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Delete any existing tokens for this email
            await prisma.twoFactorToken.deleteMany({
              where: { email: user.email },
            });

            await prisma.twoFactorToken.create({
              data: {
                email: user.email,
                token: code,
                expires,
              },
            });

            // Send 2FA code via email
            try {
              const template = emailTemplates.twoFactorCode(
                user.name || "User",
                code
              );
              await sendEmail({
                to: user.email,
                subject: template.subject,
                html: template.html,
              });
            } catch (e) {
              console.error("Failed to send 2FA code:", e);
            }

            throw new Error("2FA_REQUIRED");
          }

          // Verify 2FA code
          const twoFactorToken = await prisma.twoFactorToken.findFirst({
            where: {
              email: user.email,
              token: credentials.twoFactorCode,
              expires: { gt: new Date() },
            },
          });

          if (!twoFactorToken) {
            throw new Error("Invalid or expired 2FA code.");
          }

          // Delete used token
          await prisma.twoFactorToken.delete({
            where: { id: twoFactorToken.id },
          });
        }

        // Successful login - reset failed attempts and update login info
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
            lastLoginIp: req?.headers?.["x-forwarded-for"]?.toString() || null,
          },
        });

        // Log successful login
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            ipAddress: req?.headers?.["x-forwarded-for"]?.toString() || null,
            userAgent: req?.headers?.["user-agent"]?.toString() || null,
            success: true,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      // Refresh role from database on every request to catch role changes
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, isActive: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          // Invalidate session if user is deactivated
          if (!dbUser.isActive) {
            return {} as any;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/email";
import { generateSecureToken } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a password reset email has been sent.",
      });
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    // Generate reset token
    const token = generateSecureToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires,
      },
    });

    // Send password reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
    try {
      const template = emailTemplates.passwordReset(
        user.name || "User",
        resetUrl
      );
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists, a password reset email has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

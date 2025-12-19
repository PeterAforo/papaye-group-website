import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/email";
import {
  registrationSchema,
  generateSecureToken,
  sanitizeInput,
  getClientIp,
} from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    // Validate input with Zod schema
    const validationResult = registrationSchema.safeParse({
      name: sanitizeInput(name || ""),
      email: email?.toLowerCase().trim(),
      password,
      phone: phone || "",
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e: { message: string }) => e.message);
      return NextResponse.json(
        { error: errors[0] },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password with strong salt rounds
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user with isActive = false (requires email verification)
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone || null,
        role: "CUSTOMER",
        isActive: false, // Account inactive until email verified
      },
    });

    // Create empty cart for user
    await prisma.cart.create({
      data: {
        userId: user.id,
      },
    });

    // Generate email verification token
    const verificationToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        email: validatedData.email,
        token: verificationToken,
        expires: expiresAt,
      },
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;
    try {
      const template = emailTemplates.emailVerification(
        validatedData.name,
        verificationUrl
      );
      await sendEmail({
        to: validatedData.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails, user can request resend
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully. Please check your email to verify your account.",
      requiresVerification: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}

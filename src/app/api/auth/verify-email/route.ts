import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });
      return NextResponse.json(
        { error: "Verification token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Find and activate the user
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Activate the user account
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        emailVerified: new Date(),
      },
    });

    // Delete the verification token
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}

// Resend verification email
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

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({
        success: true,
        message: "If an account exists, a verification email has been sent.",
      });
    }

    if (user.isActive) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Delete any existing tokens
    await prisma.emailVerificationToken.deleteMany({
      where: { email: user.email },
    });

    // Generate new token
    const crypto = await import("crypto");
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        email: user.email,
        token,
        expires,
      },
    });

    // Send verification email
    const { sendEmail, emailTemplates } = await import("@/lib/email");
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;
    
    try {
      const template = emailTemplates.emailVerification(
        user.name || "User",
        verificationUrl
      );
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists, a verification email has been sent.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}

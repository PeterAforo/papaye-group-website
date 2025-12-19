import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { passwordSchema } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
      return NextResponse.json(
        { error: passwordValidation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      return NextResponse.json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and reset failed attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Delete the reset token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    // Send security alert email
    try {
      const { sendEmail, emailTemplates } = await import("@/lib/email");
      const template = emailTemplates.securityAlert(
        user.name || "User",
        "Password changed",
        "Unknown",
        new Date().toLocaleString()
      );
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (emailError) {
      console.error("Failed to send security alert:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}

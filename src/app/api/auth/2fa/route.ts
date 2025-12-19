import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/auth";

// Enable 2FA for user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Two-factor authentication enabled successfully.",
    });
  } catch (error) {
    console.error("Enable 2FA error:", error);
    return NextResponse.json(
      { error: "Failed to enable 2FA" },
      { status: 500 }
    );
  }
}

// Disable 2FA for user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    // Delete any existing 2FA tokens
    await prisma.twoFactorToken.deleteMany({
      where: { email: user.email },
    });

    return NextResponse.json({
      success: true,
      message: "Two-factor authentication disabled.",
    });
  } catch (error) {
    console.error("Disable 2FA error:", error);
    return NextResponse.json(
      { error: "Failed to disable 2FA" },
      { status: 500 }
    );
  }
}

// Get 2FA status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (error) {
    console.error("Get 2FA status error:", error);
    return NextResponse.json(
      { error: "Failed to get 2FA status" },
      { status: 500 }
    );
  }
}

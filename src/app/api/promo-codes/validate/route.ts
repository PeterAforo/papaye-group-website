import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// Validate promo code for checkout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json({ error: "Promo code is required" }, { status: 400 });
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 400 });
    }

    // Check if active
    if (!promoCode.isActive) {
      return NextResponse.json({ error: "This promo code is no longer active" }, { status: 400 });
    }

    // Check dates
    const now = new Date();
    if (promoCode.startDate && now < promoCode.startDate) {
      return NextResponse.json({ error: "This promo code is not yet active" }, { status: 400 });
    }
    if (promoCode.endDate && now > promoCode.endDate) {
      return NextResponse.json({ error: "This promo code has expired" }, { status: 400 });
    }

    // Check usage limit
    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      return NextResponse.json({ error: "This promo code has reached its usage limit" }, { status: 400 });
    }

    // Check minimum order amount
    if (promoCode.minOrderAmount && subtotal < promoCode.minOrderAmount) {
      return NextResponse.json({
        error: `Minimum order of GH₵${promoCode.minOrderAmount.toFixed(2)} required for this code`,
      }, { status: 400 });
    }

    // Check per-user limit
    const session = await getServerSession(authOptions);
    if (promoCode.perUserLimit && session?.user) {
      const userUsageCount = await prisma.promoCodeUsage.count({
        where: {
          promoCodeId: promoCode.id,
          userId: (session.user as any).id,
        },
      });
      if (userUsageCount >= promoCode.perUserLimit) {
        return NextResponse.json({
          error: "You have already used this promo code the maximum number of times",
        }, { status: 400 });
      }
    }

    // Calculate discount
    let discount = 0;
    if (promoCode.discountType === "PERCENTAGE") {
      discount = (subtotal * promoCode.discountValue) / 100;
      if (promoCode.maxDiscount && discount > promoCode.maxDiscount) {
        discount = promoCode.maxDiscount;
      }
    } else if (promoCode.discountType === "FIXED") {
      discount = promoCode.discountValue;
    } else if (promoCode.discountType === "FREE_DELIVERY") {
      discount = 0; // Delivery fee will be handled separately
    }

    return NextResponse.json({
      valid: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        description: promoCode.description,
      },
      discount,
      message: promoCode.discountType === "FREE_DELIVERY" 
        ? "Free delivery applied!" 
        : `Discount of GH₵${discount.toFixed(2)} applied!`,
    });
  } catch (error) {
    console.error("Validate promo code error:", error);
    return NextResponse.json({ error: "Failed to validate promo code" }, { status: 500 });
  }
}

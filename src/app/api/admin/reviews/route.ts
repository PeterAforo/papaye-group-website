import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// Get all order reviews
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reviews = await prisma.orderReview.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Get order details for each review
    const reviewsWithOrders = await Promise.all(
      reviews.map(async (review) => {
        const order = await prisma.order.findUnique({
          where: { id: review.orderId },
          select: {
            orderNumber: true,
            user: { select: { name: true, email: true } },
            guestName: true,
            guestEmail: true,
          },
        });
        return { ...review, order };
      })
    );

    // Calculate stats
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    const avgFoodRating = reviews.filter(r => r.foodRating).length > 0
      ? reviews.filter(r => r.foodRating).reduce((sum, r) => sum + (r.foodRating || 0), 0) / reviews.filter(r => r.foodRating).length
      : 0;
    const avgServiceRating = reviews.filter(r => r.serviceRating).length > 0
      ? reviews.filter(r => r.serviceRating).reduce((sum, r) => sum + (r.serviceRating || 0), 0) / reviews.filter(r => r.serviceRating).length
      : 0;
    const avgDeliveryRating = reviews.filter(r => r.deliveryRating).length > 0
      ? reviews.filter(r => r.deliveryRating).reduce((sum, r) => sum + (r.deliveryRating || 0), 0) / reviews.filter(r => r.deliveryRating).length
      : 0;

    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    return NextResponse.json({
      reviews: reviewsWithOrders,
      stats: {
        totalReviews: reviews.length,
        avgRating,
        avgFoodRating,
        avgServiceRating,
        avgDeliveryRating,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// Toggle review visibility
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, isPublic } = body;

    const review = await prisma.orderReview.update({
      where: { id },
      data: { isPublic },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

// Delete review
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.orderReview.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}

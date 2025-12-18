import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get("details") === "true";

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        subtotal: true,
        deliveryFee: true,
        deliveryType: true,
        paymentMethod: true,
        status: true,
        createdAt: true,
        notes: true,
        address: includeDetails ? {
          select: {
            street: true,
            city: true,
            region: true,
            landmark: true,
          },
        } : false,
        items: includeDetails ? {
          select: {
            id: true,
            quantity: true,
            price: true,
            menuItem: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        } : false,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

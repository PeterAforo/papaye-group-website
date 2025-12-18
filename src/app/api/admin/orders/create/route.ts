import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAP-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow admin, branch managers, and staff to create orders from backend
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !["ADMIN", "BRANCH_MANAGER", "STAFF"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      items, 
      deliveryType, 
      paymentMethod, 
      branchId,
      address, 
      notes, 
      guestInfo 
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in order" },
        { status: 400 }
      );
    }

    if (!guestInfo?.name || !guestInfo?.phone) {
      return NextResponse.json(
        { error: "Customer name and phone are required" },
        { status: 400 }
      );
    }

    // Get menu items and calculate totals
    const menuItemIds = items.map((item: any) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    if (menuItems.length !== items.length) {
      return NextResponse.json(
        { error: "Some items are no longer available" },
        { status: 400 }
      );
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const menuItem = menuItems.find((mi: { id: string }) => mi.id === item.menuItemId)!;
      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;
      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        notes: item.notes,
      };
    });

    // Get delivery fee from settings
    const deliveryFeeSetting = await prisma.setting.findUnique({
      where: { key: "delivery_fee" },
    });
    const freeDeliveryThreshold = await prisma.setting.findUnique({
      where: { key: "free_delivery_threshold" },
    });

    const baseFee = parseFloat(deliveryFeeSetting?.value || "10");
    const threshold = parseFloat(freeDeliveryThreshold?.value || "100");
    const deliveryFee = deliveryType === "DELIVERY" && subtotal < threshold ? baseFee : 0;
    const total = subtotal + deliveryFee;

    // Create address if delivery
    let addressId = null;
    if (deliveryType === "DELIVERY" && address) {
      const newAddress = await prisma.address.create({
        data: {
          name: address.name || guestInfo.name,
          phone: address.phone || guestInfo.phone,
          street: address.street,
          city: address.city || "Accra",
          region: address.region || "Greater Accra",
          landmark: address.landmark,
        },
      });
      addressId = newAddress.id;
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        branchId: branchId || null,
        addressId,
        subtotal,
        deliveryFee,
        total,
        status: "CONFIRMED", // Backend orders start as confirmed
        paymentMethod,
        paymentStatus: paymentMethod === "CASH" ? "PENDING" : "PENDING",
        deliveryType,
        notes: notes ? `[Backend Order] ${notes}` : "[Backend Order]",
        estimatedTime: 30,
        guestName: guestInfo.name,
        guestEmail: guestInfo.email || null,
        guestPhone: guestInfo.phone,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      total: order.total,
    });
  } catch (error) {
    console.error("Backend order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

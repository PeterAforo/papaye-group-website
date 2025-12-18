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
    const body = await request.json();
    const { items, deliveryType, paymentMethod, address, notes, isGuest, guestInfo } = body;

    // For guest checkout, we don't require authentication
    const isGuestCheckout = isGuest && guestInfo;
    
    if (!session?.user && !isGuestCheckout) {
      return NextResponse.json({ error: "Please provide contact information" }, { status: 401 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
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

    // Get user ID (null for guest checkout)
    const userId = session?.user ? (session.user as any).id : null;

    // Create address if delivery
    let addressId = null;
    if (deliveryType === "DELIVERY" && address) {
      const addressData: any = {
        name: address.name || guestInfo?.name,
        phone: address.phone || guestInfo?.phone,
        street: address.street,
        city: address.city,
        region: address.region || "Greater Accra",
        landmark: address.landmark,
      };
      
      // Only link to user if logged in
      if (userId) {
        addressData.userId = userId;
      }

      const newAddress = await prisma.address.create({
        data: addressData,
      });
      addressId = newAddress.id;
    }

    // Prepare order data
    const orderData: any = {
      orderNumber: generateOrderNumber(),
      addressId,
      subtotal,
      deliveryFee,
      total,
      status: "PENDING",
      paymentMethod,
      paymentStatus: "PENDING",
      deliveryType,
      notes,
      estimatedTime: 30, // Default 30 minutes
      items: {
        create: orderItems,
      },
    };

    // Add user ID if logged in, otherwise store guest info
    if (userId) {
      orderData.userId = userId;
    } else if (isGuestCheckout) {
      // Store guest info in dedicated fields
      orderData.guestName = guestInfo.name;
      orderData.guestEmail = guestInfo.email;
      orderData.guestPhone = guestInfo.phone;
    }

    // Create order
    const order = await prisma.order.create({
      data: orderData,
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
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: (session.user as any).id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        address: true,
      },
      orderBy: { createdAt: "desc" },
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

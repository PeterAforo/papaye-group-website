import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/email";
import { sendSMS, smsTemplates } from "@/lib/sms";

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAP-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    // Check if online orders are enabled
    const onlineOrdersSetting = await prisma.setting.findUnique({
      where: { key: "onlineOrdersEnabled" },
    });
    
    if (onlineOrdersSetting?.value === "false") {
      return NextResponse.json(
        { error: "Online orders are currently disabled. Please try again later or visit us in-store." },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { items, deliveryType, paymentMethod, branchId, address, notes, isGuest, guestInfo } = body;

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
      branchId: branchId || null,
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
        address: true,
      },
    });

    // Get customer info for notifications
    let customerName = "";
    let customerEmail = "";
    let customerPhone = "";

    if (isGuestCheckout) {
      customerName = guestInfo.name;
      customerEmail = guestInfo.email;
      customerPhone = guestInfo.phone;

      // Save guest customer to contacts database
      if (customerEmail) {
        try {
          await prisma.customerContact.upsert({
            where: { email: customerEmail },
            update: {
              name: customerName || undefined,
              phone: customerPhone || undefined,
              orderCount: { increment: 1 },
              totalSpent: { increment: order.total },
              lastOrderAt: new Date(),
            },
            create: {
              email: customerEmail,
              name: customerName || null,
              phone: customerPhone || null,
              source: "guest_order",
              orderCount: 1,
              totalSpent: order.total,
              lastOrderAt: new Date(),
            },
          });
        } catch (e) {
          console.error("Failed to save guest contact:", e);
        }
      }
    } else if (session?.user) {
      const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { name: true, email: true, phone: true },
      });
      customerName = user?.name || "Customer";
      customerEmail = user?.email || "";
      customerPhone = user?.phone || address?.phone || "";
    }

    // Build address string for notifications
    const addressString = order.address 
      ? `${order.address.street}, ${order.address.city}, ${order.address.region}${order.address.landmark ? ` (Near ${order.address.landmark})` : ''}`
      : undefined;

    // Send notifications (don't block order creation if notifications fail)
    const sendNotifications = async () => {
      const companyEmail = process.env.CONTACT_EMAIL || process.env.COMPANY_EMAIL;
      const companyPhone = process.env.COMPANY_PHONE;

      // 1. Send email to customer
      if (customerEmail) {
        try {
          const customerTemplate = emailTemplates.orderConfirmation(
            order.orderNumber,
            customerName,
            order.items,
            order.total,
            deliveryType,
            addressString
          );
          await sendEmail({
            to: customerEmail,
            subject: customerTemplate.subject,
            html: customerTemplate.html,
          });
          console.log("Customer email sent:", customerEmail);
        } catch (e) {
          console.error("Failed to send customer email:", e);
        }
      }

      // 2. Send email to company
      if (companyEmail) {
        try {
          const companyTemplate = emailTemplates.newOrderAlert(
            order.orderNumber,
            customerName,
            customerPhone,
            customerEmail,
            order.items,
            order.total,
            deliveryType,
            addressString
          );
          await sendEmail({
            to: companyEmail,
            subject: companyTemplate.subject,
            html: companyTemplate.html,
          });
          console.log("Company email sent:", companyEmail);
        } catch (e) {
          console.error("Failed to send company email:", e);
        }
      }

      // 3. Send SMS to customer
      if (customerPhone) {
        try {
          await sendSMS({
            to: customerPhone,
            message: smsTemplates.orderConfirmationCustomer(order.orderNumber, order.total),
          });
          console.log("Customer SMS sent:", customerPhone);
        } catch (e) {
          console.error("Failed to send customer SMS:", e);
        }
      }

      // 4. Send SMS to company
      if (companyPhone) {
        try {
          await sendSMS({
            to: companyPhone,
            message: smsTemplates.orderConfirmationCompany(
              order.orderNumber,
              customerName,
              order.total,
              customerPhone
            ),
          });
          console.log("Company SMS sent:", companyPhone);
        } catch (e) {
          console.error("Failed to send company SMS:", e);
        }
      }
    };

    // Run notifications in background (don't await)
    sendNotifications().catch(console.error);

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

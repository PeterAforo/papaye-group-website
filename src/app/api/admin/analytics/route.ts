import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "overview";
    const period = searchParams.get("period") || "30"; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    if (type === "customers") {
      // Customer Analytics
      const customers = await prisma.user.findMany({
        where: { role: "CUSTOMER" },
        include: {
          orders: {
            where: { status: "DELIVERED" },
            select: { total: true, createdAt: true },
          },
        },
      });

      const customerStats = customers.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        orderCount: c.orders.length,
        totalSpent: c.orders.reduce((sum, o) => sum + o.total, 0),
        avgOrderValue: c.orders.length > 0 
          ? c.orders.reduce((sum, o) => sum + o.total, 0) / c.orders.length 
          : 0,
        lastOrder: c.orders.length > 0 
          ? c.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt 
          : null,
        joinedAt: c.createdAt,
      }));

      // Sort by total spent
      customerStats.sort((a, b) => b.totalSpent - a.totalSpent);

      return NextResponse.json({
        customers: customerStats.slice(0, 100),
        summary: {
          totalCustomers: customers.length,
          activeCustomers: customers.filter(c => c.orders.length > 0).length,
          avgLifetimeValue: customerStats.length > 0 
            ? customerStats.reduce((sum, c) => sum + c.totalSpent, 0) / customerStats.length 
            : 0,
          avgOrdersPerCustomer: customerStats.length > 0
            ? customerStats.reduce((sum, c) => sum + c.orderCount, 0) / customerStats.length
            : 0,
        },
      });
    }

    if (type === "menu") {
      // Menu Performance
      const orderItems = await prisma.orderItem.findMany({
        where: {
          order: {
            createdAt: { gte: startDate },
            status: { not: "CANCELLED" },
          },
        },
        include: {
          menuItem: {
            include: { category: true },
          },
        },
      });

      // Aggregate by menu item
      const menuStats: Record<string, any> = {};
      orderItems.forEach(item => {
        if (!menuStats[item.menuItemId]) {
          menuStats[item.menuItemId] = {
            id: item.menuItemId,
            name: item.menuItem.name,
            category: item.menuItem.category.name,
            price: item.menuItem.price,
            totalOrdered: 0,
            totalRevenue: 0,
          };
        }
        menuStats[item.menuItemId].totalOrdered += item.quantity;
        menuStats[item.menuItemId].totalRevenue += item.price * item.quantity;
      });

      const menuArray = Object.values(menuStats);
      menuArray.sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

      // Category breakdown
      const categoryStats: Record<string, any> = {};
      menuArray.forEach((item: any) => {
        if (!categoryStats[item.category]) {
          categoryStats[item.category] = { name: item.category, revenue: 0, orders: 0 };
        }
        categoryStats[item.category].revenue += item.totalRevenue;
        categoryStats[item.category].orders += item.totalOrdered;
      });

      return NextResponse.json({
        topItems: menuArray.slice(0, 20),
        slowItems: menuArray.slice(-10).reverse(),
        categoryBreakdown: Object.values(categoryStats).sort((a: any, b: any) => b.revenue - a.revenue),
        summary: {
          totalItemsSold: menuArray.reduce((sum: number, i: any) => sum + i.totalOrdered, 0),
          totalRevenue: menuArray.reduce((sum: number, i: any) => sum + i.totalRevenue, 0),
          uniqueItems: menuArray.length,
        },
      });
    }

    if (type === "sales") {
      // Sales Reports
      const orders = await prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { not: "CANCELLED" },
        },
        include: {
          items: true,
          branch: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Daily breakdown
      const dailyStats: Record<string, any> = {};
      orders.forEach(order => {
        const date = order.createdAt.toISOString().split("T")[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { date, orders: 0, revenue: 0, items: 0 };
        }
        dailyStats[date].orders++;
        dailyStats[date].revenue += order.total;
        dailyStats[date].items += order.items.reduce((sum, i) => sum + i.quantity, 0);
      });

      // Payment method breakdown
      const paymentStats: Record<string, number> = {};
      orders.forEach(order => {
        const method = order.paymentMethod || "Unknown";
        paymentStats[method] = (paymentStats[method] || 0) + order.total;
      });

      // Delivery type breakdown
      const deliveryStats = {
        DELIVERY: orders.filter(o => o.deliveryType === "DELIVERY").length,
        PICKUP: orders.filter(o => o.deliveryType === "PICKUP").length,
      };

      return NextResponse.json({
        dailyBreakdown: Object.values(dailyStats).sort((a: any, b: any) => a.date.localeCompare(b.date)),
        paymentBreakdown: Object.entries(paymentStats).map(([method, amount]) => ({ method, amount })),
        deliveryBreakdown: deliveryStats,
        summary: {
          totalOrders: orders.length,
          totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
          avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
          totalItems: orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0),
        },
      });
    }

    // Default overview
    const totalOrders = await prisma.order.count({
      where: { createdAt: { gte: startDate }, status: { not: "CANCELLED" } },
    });
    const totalRevenue = await prisma.order.aggregate({
      where: { createdAt: { gte: startDate }, status: "DELIVERED" },
      _sum: { total: true },
    });
    const newCustomers = await prisma.user.count({
      where: { createdAt: { gte: startDate }, role: "CUSTOMER" },
    });

    return NextResponse.json({
      overview: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        newCustomers,
        period: parseInt(period),
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

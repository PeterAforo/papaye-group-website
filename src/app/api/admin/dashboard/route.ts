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

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get last 7 days for trend chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push(date);
    }

    // Get stats - exclude cancelled orders from counts and revenue
    const [
      totalOrders,
      totalRevenue,
      totalUsers,
      pendingOrders,
      todayOrders,
      todayRevenue,
      recentOrders,
      cancelledOrders,
      deliveredOrders,
      preparingOrders,
      branchPerformance,
      allBranches,
      last7DaysOrders,
    ] = await Promise.all([
      // Total orders excluding cancelled
      prisma.order.count({
        where: { status: { not: "CANCELLED" } },
      }),
      // Total revenue from delivered/completed orders only
      prisma.order.aggregate({
        _sum: { total: true },
        where: { 
          status: { in: ["DELIVERED", "READY", "OUT_FOR_DELIVERY"] },
        },
      }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      // Today's orders excluding cancelled
      prisma.order.count({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          status: { not: "CANCELLED" },
        },
      }),
      // Today's revenue from non-cancelled orders
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: today, lt: tomorrow },
          status: { not: "CANCELLED" },
        },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: "PREPARING" } }),
      // Branch performance - orders grouped by branch
      prisma.order.groupBy({
        by: ["branchId"],
        where: {
          branchId: { not: null },
          status: { not: "CANCELLED" },
        },
        _count: { id: true },
        _sum: { total: true },
      }),
      // All branches for complete data
      prisma.branch.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
      }),
      // Last 7 days orders for trend
      prisma.order.findMany({
        where: {
          createdAt: { gte: last7Days[0] },
          status: { not: "CANCELLED" },
        },
        select: {
          id: true,
          total: true,
          createdAt: true,
          branchId: true,
        },
      }),
    ]);

    // Create branch map from all branches
    const branchMap = new Map(allBranches.map((b) => [b.id, b.name]));
    
    // Branch stats with performance data
    const branchStats = allBranches.map((branch) => {
      const perf = branchPerformance.find((p) => p.branchId === branch.id);
      return {
        branchId: branch.id,
        branchName: branch.name,
        orderCount: perf?._count.id || 0,
        revenue: perf?._sum.total || 0,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Process 7-day trend data
    const dailyTrend = last7Days.map((date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayOrders = last7DaysOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= date && orderDate < nextDay;
      });

      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      return {
        date: dateStr,
        day: dayName,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      };
    });

    // Branch daily performance for stacked chart
    const branchDailyData = last7Days.map((date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const dayData: Record<string, any> = { date: dateStr };
      
      allBranches.forEach((branch) => {
        const branchOrders = last7DaysOrders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate >= date &&
            orderDate < nextDay &&
            order.branchId === branch.id
          );
        });
        dayData[branch.name] = branchOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      });

      return dayData;
    });

    // Order status distribution for pie chart
    const statusDistribution = [
      { name: "Pending", value: pendingOrders, color: "#eab308" },
      { name: "Preparing", value: preparingOrders, color: "#a855f7" },
      { name: "Delivered", value: deliveredOrders, color: "#22c55e" },
      { name: "Cancelled", value: cancelledOrders, color: "#ef4444" },
    ];

    return NextResponse.json({
      stats: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalUsers,
        pendingOrders,
        todayOrders,
        todayRevenue: todayRevenue._sum.total || 0,
        cancelledOrders,
        deliveredOrders,
        preparingOrders,
      },
      branchStats,
      dailyTrend,
      branchDailyData,
      statusDistribution,
      branchNames: allBranches.map((b) => b.name),
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

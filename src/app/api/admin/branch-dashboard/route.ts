import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Get user with branch info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        branch: true,
      },
    });

    if (!user?.branchId || !user.branch) {
      return NextResponse.json(
        { error: "No branch assigned to your account" },
        { status: 400 }
      );
    }

    const branchId = user.branchId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get order statistics for this branch
    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      preparingOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      todayRevenue,
      recentOrders,
      unreadMessages,
    ] = await Promise.all([
      // Total orders for branch
      prisma.order.count({
        where: { branchId },
      }),
      // Today's orders
      prisma.order.count({
        where: {
          branchId,
          createdAt: { gte: today },
        },
      }),
      // Pending orders
      prisma.order.count({
        where: { branchId, status: "PENDING" },
      }),
      // Preparing orders
      prisma.order.count({
        where: { branchId, status: "PREPARING" },
      }),
      // Delivered orders
      prisma.order.count({
        where: { branchId, status: "DELIVERED" },
      }),
      // Cancelled orders
      prisma.order.count({
        where: { branchId, status: "CANCELLED" },
      }),
      // Total revenue (excluding cancelled)
      prisma.order.aggregate({
        where: {
          branchId,
          status: { not: "CANCELLED" },
        },
        _sum: { total: true },
      }),
      // Today's revenue
      prisma.order.aggregate({
        where: {
          branchId,
          status: { not: "CANCELLED" },
          createdAt: { gte: today },
        },
        _sum: { total: true },
      }),
      // Recent orders
      prisma.order.findMany({
        where: { branchId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
          guestName: true,
        },
      }),
      // Unread messages (if branch has associated messages - for now count all unread)
      prisma.contactMessage.count({
        where: { isRead: false },
      }),
    ]);

    return NextResponse.json({
      branchName: user.branch.name,
      totalOrders,
      todayOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      todayRevenue: todayRevenue._sum.total || 0,
      pendingOrders,
      preparingOrders,
      deliveredOrders,
      cancelledOrders,
      unreadMessages,
      recentOrders,
    });
  } catch (error) {
    console.error("Branch dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch branch statistics" },
      { status: 500 }
    );
  }
}

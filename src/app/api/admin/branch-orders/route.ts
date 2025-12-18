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

    // Only allow branch managers and staff
    if (!["BRANCH_MANAGER", "STAFF", "ADMIN"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's branch
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { branchId: true },
    });

    // Admin can see all orders, branch manager/staff only see their branch
    const whereClause = userRole === "ADMIN" 
      ? {} 
      : { branchId: user?.branchId || undefined };

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            menuItem: {
              select: { name: true, image: true },
            },
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Get branch orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

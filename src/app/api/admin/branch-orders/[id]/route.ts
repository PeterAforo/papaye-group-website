import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Only allow branch managers, staff, and admin
    if (!["BRANCH_MANAGER", "STAFF", "ADMIN"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    // Verify the order belongs to user's branch (unless admin)
    if (userRole !== "ADMIN") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { branchId: true },
      });

      const order = await prisma.order.findUnique({
        where: { id: params.id },
        select: { branchId: true },
      });

      if (order?.branchId !== user?.branchId) {
        return NextResponse.json(
          { error: "You can only update orders from your branch" },
          { status: 403 }
        );
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

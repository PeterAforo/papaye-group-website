import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// Get loyalty program stats and rewards
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all loyalty accounts
    const loyaltyAccounts = await prisma.loyaltyPoints.findMany({
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    // Get rewards
    const rewards = await prisma.loyaltyReward.findMany({
      orderBy: { pointsCost: "asc" },
    });

    // Calculate stats
    const totalMembers = loyaltyAccounts.length;
    const totalPointsIssued = loyaltyAccounts.reduce((sum, a) => sum + a.totalEarned, 0);
    const totalPointsRedeemed = loyaltyAccounts.reduce((sum, a) => sum + a.totalSpent, 0);
    const tierDistribution = {
      BRONZE: loyaltyAccounts.filter(a => a.tier === "BRONZE").length,
      SILVER: loyaltyAccounts.filter(a => a.tier === "SILVER").length,
      GOLD: loyaltyAccounts.filter(a => a.tier === "GOLD").length,
      PLATINUM: loyaltyAccounts.filter(a => a.tier === "PLATINUM").length,
    };

    return NextResponse.json({
      stats: {
        totalMembers,
        totalPointsIssued,
        totalPointsRedeemed,
        tierDistribution,
      },
      rewards,
      topMembers: loyaltyAccounts
        .sort((a, b) => b.points - a.points)
        .slice(0, 10),
    });
  } catch (error) {
    console.error("Get loyalty stats error:", error);
    return NextResponse.json({ error: "Failed to fetch loyalty data" }, { status: 500 });
  }
}

// Create/Update loyalty reward
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, pointsCost, rewardType, rewardValue, menuItemId, isActive } = body;

    if (!name || !pointsCost || !rewardType) {
      return NextResponse.json({ error: "Name, points cost, and reward type are required" }, { status: 400 });
    }

    if (id) {
      // Update existing reward
      const reward = await prisma.loyaltyReward.update({
        where: { id },
        data: { name, description, pointsCost, rewardType, rewardValue, menuItemId, isActive },
      });
      return NextResponse.json(reward);
    } else {
      // Create new reward
      const reward = await prisma.loyaltyReward.create({
        data: { name, description, pointsCost, rewardType, rewardValue, menuItemId, isActive: isActive ?? true },
      });
      return NextResponse.json(reward);
    }
  } catch (error) {
    console.error("Save loyalty reward error:", error);
    return NextResponse.json({ error: "Failed to save reward" }, { status: 500 });
  }
}

// Delete reward
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

    await prisma.loyaltyReward.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete reward error:", error);
    return NextResponse.json({ error: "Failed to delete reward" }, { status: 500 });
  }
}

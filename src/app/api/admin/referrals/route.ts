import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// Get referral stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const referrals = await prisma.referral.findMany({
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      totalReferrals: referrals.length,
      pending: referrals.filter(r => r.status === "PENDING").length,
      signedUp: referrals.filter(r => r.status === "SIGNED_UP").length,
      completed: referrals.filter(r => r.status === "COMPLETED").length,
      totalRewardsGiven: referrals.filter(r => r.rewardGiven).reduce((sum, r) => sum + (r.rewardAmount || 0), 0),
    };

    return NextResponse.json({ stats, referrals });
  } catch (error) {
    console.error("Get referrals error:", error);
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 });
  }
}

// Update referral settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { referrerReward, referredReward } = body;

    // Save settings
    await prisma.setting.upsert({
      where: { key: "referral_referrer_reward" },
      update: { value: referrerReward.toString() },
      create: { key: "referral_referrer_reward", value: referrerReward.toString() },
    });

    await prisma.setting.upsert({
      where: { key: "referral_referred_reward" },
      update: { value: referredReward.toString() },
      create: { key: "referral_referred_reward", value: referredReward.toString() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update referral settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Public API for team members
export async function GET() {
  try {
    const team = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error("Get team error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 }
    );
  }
}

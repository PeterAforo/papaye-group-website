import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Public API for stories (About page timeline)
export async function GET() {
  try {
    const stories = await prisma.story.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Get stories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

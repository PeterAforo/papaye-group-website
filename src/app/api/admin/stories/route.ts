import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stories = await prisma.story.findMany({
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, imageUrl, year, isActive } = body;

    // Get max sort order
    const maxOrder = await prisma.story.aggregate({
      _max: { sortOrder: true },
    });

    const story = await prisma.story.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        year: year || null,
        isActive: isActive !== false,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error("Create story error:", error);
    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
}

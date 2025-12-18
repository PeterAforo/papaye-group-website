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

    const sections = await prisma.homepageSection.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error("Get homepage sections error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sections" },
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
    const { sections } = body;

    // Upsert each section
    const updates = sections.map((section: any, index: number) =>
      prisma.homepageSection.upsert({
        where: { section: section.section },
        update: {
          title: section.title || null,
          subtitle: section.subtitle || null,
          content: section.content || null,
          imageUrl: section.imageUrl || null,
          buttonText: section.buttonText || null,
          buttonLink: section.buttonLink || null,
          isActive: section.isActive,
          sortOrder: index,
          metadata: section.metadata || null,
        },
        create: {
          section: section.section,
          title: section.title || null,
          subtitle: section.subtitle || null,
          content: section.content || null,
          imageUrl: section.imageUrl || null,
          buttonText: section.buttonText || null,
          buttonLink: section.buttonLink || null,
          isActive: section.isActive !== false,
          sortOrder: index,
          metadata: section.metadata || null,
        },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save homepage sections error:", error);
    return NextResponse.json(
      { error: "Failed to save sections" },
      { status: 500 }
    );
  }
}

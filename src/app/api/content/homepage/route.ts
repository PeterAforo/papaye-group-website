import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const sections = await prisma.homepageSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    // Transform sections into a more usable format
    const content: Record<string, any> = {};
    
    sections.forEach((section) => {
      let metadata = {};
      try {
        metadata = section.metadata ? JSON.parse(section.metadata) : {};
      } catch {
        metadata = {};
      }

      content[section.section] = {
        title: section.title,
        subtitle: section.subtitle,
        content: section.content,
        imageUrl: section.imageUrl,
        buttonText: section.buttonText,
        buttonLink: section.buttonLink,
        ...metadata,
      };
    });

    return NextResponse.json(content, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error("Get homepage content error:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

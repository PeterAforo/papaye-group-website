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

    // Get all content settings
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          startsWith: "content_",
        },
      },
    });

    // Transform to page content format
    const content = settings.map((s) => {
      const parts = s.key.replace("content_", "").split("_");
      const page = parts[0];
      const section = parts.slice(1).join("_");
      return {
        id: s.id,
        page,
        section,
        content: s.value,
      };
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error("Get content error:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
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
    const { content } = body;

    // Upsert each content field as a setting
    const updates = Object.entries(content).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key: `content_${key}` },
        update: { value: String(value) },
        create: { key: `content_${key}`, value: String(value) },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save content error:", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}

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

    const albums = await prisma.galleryAlbum.findMany({
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: { images: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(albums);
  } catch (error) {
    console.error("Get albums error:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
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
    const { name, description, coverImage, isActive } = body;

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check for unique slug
    const existing = await prisma.galleryAlbum.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const maxOrder = await prisma.galleryAlbum.aggregate({
      _max: { sortOrder: true },
    });

    const album = await prisma.galleryAlbum.create({
      data: {
        name,
        slug: finalSlug,
        description: description || null,
        coverImage: coverImage || null,
        isActive: isActive !== false,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    });

    return NextResponse.json(album);
  } catch (error) {
    console.error("Create album error:", error);
    return NextResponse.json(
      { error: "Failed to create album" },
      { status: 500 }
    );
  }
}

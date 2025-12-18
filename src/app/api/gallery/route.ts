import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const albums = await prisma.galleryAlbum.findMany({
      where: { isActive: true },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      albums: albums.map((album) => ({
        id: album.id,
        name: album.name,
        slug: album.slug,
        description: album.description,
        coverImage: album.coverImage,
        images: album.images.map((img) => ({
          id: img.id,
          url: img.imageUrl,
          caption: img.caption,
        })),
      })),
    });
  } catch (error) {
    console.error("Get gallery error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}

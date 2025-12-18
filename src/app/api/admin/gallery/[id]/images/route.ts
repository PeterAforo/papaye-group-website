import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, caption } = body;

    const maxOrder = await prisma.galleryImage.aggregate({
      where: { albumId: params.id },
      _max: { sortOrder: true },
    });

    const image = await prisma.galleryImage.create({
      data: {
        albumId: params.id,
        imageUrl,
        caption: caption || null,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error("Add image error:", error);
    return NextResponse.json(
      { error: "Failed to add image" },
      { status: 500 }
    );
  }
}

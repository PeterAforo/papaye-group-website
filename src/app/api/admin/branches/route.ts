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

    const branches = await prisma.branch.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(branches);
  } catch (error) {
    console.error("Get branches error:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
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
    const { name, address, phone, email, hours, mapUrl, latitude, longitude, image, isFeatured, isActive } = body;

    if (!name || !address || !phone || !hours) {
      return NextResponse.json(
        { error: "Name, address, phone, and hours are required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const existingBranch = await prisma.branch.findUnique({
      where: { slug },
    });

    const finalSlug = existingBranch ? `${slug}-${Date.now()}` : slug;

    const branch = await prisma.branch.create({
      data: {
        name,
        slug: finalSlug,
        address,
        phone,
        email: email || null,
        hours,
        mapUrl: mapUrl || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        image: image || null,
        isFeatured: isFeatured === true,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(branch);
  } catch (error) {
    console.error("Create branch error:", error);
    return NextResponse.json(
      { error: "Failed to create branch" },
      { status: 500 }
    );
  }
}

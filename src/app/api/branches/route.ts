import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      branches: branches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        location: branch.address,
        phone: branch.phone,
        hours: branch.hours,
        mapUrl: branch.mapUrl || `https://maps.google.com/maps?q=${branch.latitude},${branch.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
        coordinates: { lat: branch.latitude, lng: branch.longitude },
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`,
        image: branch.image,
        featured: branch.isFeatured,
      })),
    });
  } catch (error) {
    console.error("Get branches error:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}

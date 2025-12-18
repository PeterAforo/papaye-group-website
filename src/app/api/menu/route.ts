import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    const menuItems = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      categories: categories.map((cat) => ({
        id: cat.slug,
        name: cat.name,
        icon: cat.icon || "🍽️",
      })),
      items: menuItems.map((item) => ({
        id: item.id,
        title: item.name,
        category: item.category.slug,
        price: item.price,
        image: item.image,
        description: item.description,
        popular: item.isPopular,
      })),
    });
  } catch (error) {
    console.error("Get menu error:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

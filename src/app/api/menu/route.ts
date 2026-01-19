import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    return NextResponse.json(
      {
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
          image: item.image || "/images/placeholder-food.svg",
          description: item.description,
          popular: item.isPopular,
        })),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error("Get menu error:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

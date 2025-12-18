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

    const members = await prisma.teamMember.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Get team error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team" },
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
    const { name, role, bio, imageUrl, email, phone, facebook, twitter, linkedin, isActive } = body;

    const maxOrder = await prisma.teamMember.aggregate({
      _max: { sortOrder: true },
    });

    const member = await prisma.teamMember.create({
      data: {
        name,
        role,
        bio: bio || null,
        imageUrl: imageUrl || null,
        email: email || null,
        phone: phone || null,
        facebook: facebook || null,
        twitter: twitter || null,
        linkedin: linkedin || null,
        isActive: isActive !== false,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Create team member error:", error);
    return NextResponse.json(
      { error: "Failed to create team member" },
      { status: 500 }
    );
  }
}

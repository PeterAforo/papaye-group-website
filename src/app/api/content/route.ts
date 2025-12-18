import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Fetch all site settings
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    // Fetch homepage sections
    const homepageSections = await prisma.homepageSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    // Fetch stories/timeline
    const stories = await prisma.story.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    // Fetch team members
    const team = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      settings: settingsMap,
      homepage: homepageSections.reduce((acc, section) => {
        acc[section.section] = {
          title: section.title,
          subtitle: section.subtitle,
          content: section.content,
          imageUrl: section.imageUrl,
          buttonText: section.buttonText,
          buttonLink: section.buttonLink,
          metadata: section.metadata ? JSON.parse(section.metadata) : null,
        };
        return acc;
      }, {} as Record<string, any>),
      stories: stories.map((story) => ({
        year: story.year,
        title: story.title,
        description: story.content,
        image: story.imageUrl,
      })),
      team: team.map((member) => ({
        name: member.name,
        role: member.role,
        description: member.bio,
        image: member.imageUrl,
        email: member.email,
        social: {
          facebook: member.facebook,
          twitter: member.twitter,
          linkedin: member.linkedin,
        },
      })),
    });
  } catch (error) {
    console.error("Get content error:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

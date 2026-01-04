import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "onlineOrdersEnabled" },
    });

    // Only enabled if explicitly set to "true"
    const enabled = setting?.value === "true";

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error("Get online orders setting error:", error);
    // Default to disabled if there's an error (safer)
    return NextResponse.json({ enabled: false });
  }
}

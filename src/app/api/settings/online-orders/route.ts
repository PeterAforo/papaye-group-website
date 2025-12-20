import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "onlineOrdersEnabled" },
    });

    // Default to true if setting doesn't exist
    const enabled = setting?.value !== "false";

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error("Get online orders setting error:", error);
    // Default to enabled if there's an error
    return NextResponse.json({ enabled: true });
  }
}

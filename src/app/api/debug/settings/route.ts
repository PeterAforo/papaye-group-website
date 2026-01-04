import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Debug endpoint to check all settings in database
export async function GET() {
  try {
    const allSettings = await prisma.setting.findMany();
    
    const onlineOrdersSetting = await prisma.setting.findUnique({
      where: { key: "onlineOrdersEnabled" },
    });
    
    return NextResponse.json({
      allSettings,
      onlineOrdersSetting,
      onlineOrdersEnabled: onlineOrdersSetting?.value === "true",
      rawValue: onlineOrdersSetting?.value,
      valueType: typeof onlineOrdersSetting?.value,
    });
  } catch (error) {
    console.error("Debug settings error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  // Force dynamic by reading headers
  const headersList = headers();
  try {
    // Get all settings for debugging
    const allSettings = await prisma.setting.findMany();
    
    const setting = await prisma.setting.findUnique({
      where: { key: "onlineOrdersEnabled" },
    });

    // Only enabled if explicitly set to "true"
    const enabled = setting?.value === "true";

    return NextResponse.json({ 
      enabled,
      debug: {
        rawValue: setting?.value,
        valueType: typeof setting?.value,
        settingExists: !!setting,
        allSettingKeys: allSettings.map(s => ({ key: s.key, value: s.value })),
      }
    });
  } catch (error) {
    console.error("Get online orders setting error:", error);
    // Default to disabled if there's an error (safer)
    return NextResponse.json({ enabled: false, error: String(error) });
  }
}

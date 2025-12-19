import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";

// Get all campaigns
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get users and newsletter subscribers for recipient counts
    const users = await prisma.user.findMany({
      select: { id: true, email: true, phone: true, name: true },
    });

    const newsletters = await prisma.newsletter.findMany({
      where: { isActive: true },
      select: { email: true },
    });

    // Combine unique emails
    const allEmails = new Set([
      ...users.map(u => u.email),
      ...newsletters.map(n => n.email),
    ]);

    const allPhones = users.filter(u => u.phone).map(u => u.phone);

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        totalNewsletterSubscribers: newsletters.length,
        totalUniqueEmails: allEmails.size,
        totalPhoneNumbers: allPhones.length,
      },
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        name: u.name,
      })),
    });
  } catch (error) {
    console.error("Get campaigns error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// Send bulk campaign
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, subject, message, recipients, targetAudience } = body;

    if (!type || !message) {
      return NextResponse.json(
        { error: "Type and message are required" },
        { status: 400 }
      );
    }

    let targetRecipients: { email?: string; phone?: string; name?: string }[] = [];

    // Get recipients based on target audience
    if (targetAudience === "all" || targetAudience === "users") {
      const users = await prisma.user.findMany({
        select: { email: true, phone: true, name: true },
      });
      targetRecipients.push(...users);
    }

    if (targetAudience === "all" || targetAudience === "newsletter") {
      const newsletters = await prisma.newsletter.findMany({
        where: { isActive: true },
        select: { email: true },
      });
      targetRecipients.push(...newsletters.map(n => ({ email: n.email, name: "Subscriber" })));
    }

    if (targetAudience === "custom" && recipients) {
      targetRecipients = recipients;
    }

    // Remove duplicates by email/phone
    const uniqueEmails = new Map<string, { email: string; name?: string }>();
    const uniquePhones = new Map<string, { phone: string; name?: string }>();

    targetRecipients.forEach(r => {
      if (r.email && !uniqueEmails.has(r.email)) {
        uniqueEmails.set(r.email, { email: r.email, name: r.name });
      }
      if (r.phone && !uniquePhones.has(r.phone)) {
        uniquePhones.set(r.phone, { phone: r.phone, name: r.name });
      }
    });

    const results = {
      emailsSent: 0,
      emailsFailed: 0,
      smsSent: 0,
      smsFailed: 0,
    };

    // Send emails
    if (type === "email" || type === "both") {
      const emailPromises = Array.from(uniqueEmails.values()).map(async (recipient) => {
        try {
          // Personalize message
          const personalizedMessage = message.replace(/\{name\}/g, recipient.name || "Valued Customer");
          
          await sendEmail({
            to: recipient.email,
            subject: subject || "Message from Papaye",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #E50000; padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0;">Papaye</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  ${personalizedMessage.replace(/\n/g, "<br>")}
                </div>
                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                  <p>© ${new Date().getFullYear()} Papaye Restaurant. All rights reserved.</p>
                  <p><a href="${process.env.NEXTAUTH_URL}/unsubscribe" style="color: #999;">Unsubscribe</a></p>
                </div>
              </div>
            `,
          });
          results.emailsSent++;
        } catch (e) {
          console.error(`Failed to send email to ${recipient.email}:`, e);
          results.emailsFailed++;
        }
      });

      await Promise.allSettled(emailPromises);
    }

    // Send SMS
    if (type === "sms" || type === "both") {
      const smsPromises = Array.from(uniquePhones.values()).map(async (recipient) => {
        try {
          // Personalize and truncate message for SMS (160 chars)
          let smsMessage = message.replace(/\{name\}/g, recipient.name || "Customer");
          if (smsMessage.length > 160) {
            smsMessage = smsMessage.substring(0, 157) + "...";
          }
          
          const result = await sendSMS({
            to: recipient.phone,
            message: `Papaye: ${smsMessage}`,
          });
          
          if (result.success) {
            results.smsSent++;
          } else {
            results.smsFailed++;
          }
        } catch (e) {
          console.error(`Failed to send SMS to ${recipient.phone}:`, e);
          results.smsFailed++;
        }
      });

      await Promise.allSettled(smsPromises);
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Campaign sent successfully! Emails: ${results.emailsSent} sent, ${results.emailsFailed} failed. SMS: ${results.smsSent} sent, ${results.smsFailed} failed.`,
    });
  } catch (error) {
    console.error("Send campaign error:", error);
    return NextResponse.json({ error: "Failed to send campaign" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Email configuration - In production, use environment variables
const EMAIL_CONFIG = {
  // For production, set these in .env.local:
  // SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_EMAIL
  recipientEmail: process.env.CONTACT_EMAIL || "info@papaye.com.gh",
};

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize input to prevent XSS
function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(body.name),
      email: sanitizeInput(body.email),
      phone: body.phone ? sanitizeInput(body.phone) : "",
      subject: sanitizeInput(body.subject),
      message: sanitizeInput(body.message),
    };

    // In production, you would send an actual email here
    // Example with nodemailer (install: npm install nodemailer @types/nodemailer):
    /*
    import nodemailer from 'nodemailer';
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Papaye Website" <${process.env.SMTP_USER}>`,
      to: EMAIL_CONFIG.recipientEmail,
      replyTo: sanitizedData.email,
      subject: `[Website Contact] ${sanitizedData.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${sanitizedData.name}</p>
        <p><strong>Email:</strong> ${sanitizedData.email}</p>
        <p><strong>Phone:</strong> ${sanitizedData.phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${sanitizedData.subject}</p>
        <hr />
        <h3>Message:</h3>
        <p>${sanitizedData.message.replace(/\n/g, '<br>')}</p>
      `,
    });
    */

    // Save message to database
    await prisma.contactMessage.create({
      data: {
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone || null,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
        isRead: false,
      },
    });

    // Log the submission
    console.log("Contact form submission saved:", {
      ...sanitizedData,
      timestamp: new Date().toISOString(),
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully. We will get back to you within 24 hours.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

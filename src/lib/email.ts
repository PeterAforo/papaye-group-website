import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  // Check if SMTP is configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("SMTP not configured. Email would be sent to:", to);
    console.log("Subject:", subject);
    return { success: true, message: "Email logged (SMTP not configured)" };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Papaye Restaurant" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""),
      html,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}

// Email templates
export const emailTemplates = {
  emailVerification: (name: string, verificationUrl: string) => ({
    subject: "Verify your Papaye account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #E50000; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Papaye</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Welcome, ${name}!</h2>
          <p>Thank you for creating an account with Papaye. Please verify your email address to activate your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #E50000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours. If you didn't create an account, please ignore this email.</p>
          <p>Best regards,<br>The Papaye Team</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Papaye Restaurant. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  passwordReset: (name: string, resetUrl: string) => ({
    subject: "Reset your Papaye password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #E50000; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Papaye</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #E50000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p>Best regards,<br>The Papaye Team</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Papaye Restaurant. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  twoFactorCode: (name: string, code: string) => ({
    subject: "Your Papaye login verification code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #E50000; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Papaye</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Login Verification Code</h2>
          <p>Hi ${name},</p>
          <p>Your two-factor authentication code is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="background: #f0f0f0; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; display: inline-block;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. If you didn't try to log in, please secure your account immediately.</p>
          <p>Best regards,<br>The Papaye Team</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Papaye Restaurant. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  securityAlert: (name: string, action: string, ipAddress: string, timestamp: string) => ({
    subject: "Security Alert - Papaye Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #E50000; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Papaye</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>⚠️ Security Alert</h2>
          <p>Hi ${name},</p>
          <p>We detected the following activity on your account:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Action:</strong> ${action}</p>
            <p><strong>IP Address:</strong> ${ipAddress}</p>
            <p><strong>Time:</strong> ${timestamp}</p>
          </div>
          <p>If this was you, no action is needed. If you don't recognize this activity, please change your password immediately and contact support.</p>
          <p>Best regards,<br>The Papaye Team</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Papaye Restaurant. All rights reserved.</p>
        </div>
      </div>
    `,
  }),


  contactConfirmation: (name: string) => ({
    subject: "Thank you for contacting Papaye!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #E50000; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Papaye</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hello ${name}!</h2>
          <p>Thank you for reaching out to us. We have received your message and will get back to you within 24 hours.</p>
          <p>In the meantime, feel free to explore our menu or visit one of our branches.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/menu" style="background: #E50000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View Our Menu</a>
          </div>
          <p>Best regards,<br>The Papaye Team</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Papaye Restaurant. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  orderConfirmation: (orderNumber: string, items: any[], total: number) => ({
    subject: `Order Confirmed - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #E50000; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Papaye</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Order Confirmed! 🎉</h2>
          <p>Your order <strong>${orderNumber}</strong> has been confirmed and is being prepared.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Summary</h3>
            ${items.map((item) => `
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <span>${item.quantity}x ${item.name}</span>
                <span>GH₵ ${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join("")}
            <div style="display: flex; justify-content: space-between; padding: 15px 0; font-weight: bold; font-size: 18px;">
              <span>Total</span>
              <span style="color: #E50000;">GH₵ ${total.toFixed(2)}</span>
            </div>
          </div>
          
          <p>We'll notify you when your order is ready!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/account/orders" style="background: #E50000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Track Order</a>
          </div>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Papaye Restaurant. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  newsletterWelcome: (email: string) => ({
    subject: "Welcome to Papaye Newsletter! 🍗",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #E50000; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Papaye</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Welcome to the Papaye Family! 🎉</h2>
          <p>Thank you for subscribing to our newsletter. You'll be the first to know about:</p>
          <ul>
            <li>New menu items</li>
            <li>Special offers and discounts</li>
            <li>Exclusive promotions</li>
            <li>Events and updates</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/menu" style="background: #E50000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Order Now</a>
          </div>
          <p>Best regards,<br>The Papaye Team</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Papaye Restaurant. All rights reserved.</p>
          <p><a href="${process.env.NEXTAUTH_URL}/unsubscribe?email=${email}" style="color: #999;">Unsubscribe</a></p>
        </div>
      </div>
    `,
  }),
};

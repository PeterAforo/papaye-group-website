// mNotify SMS Integration for Ghana
// API Documentation: https://developers.mnotify.com/

interface SMSOptions {
  to: string | string[];
  message: string;
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

const MNOTIFY_API_KEY = process.env.MNOTIFY_API_KEY;
const MNOTIFY_SENDER_ID = process.env.MNOTIFY_SENDER_ID || "Papaye";
const MNOTIFY_API_URL = "https://apps.mnotify.net/smsapi";

// Format Ghana phone number
function formatGhanaPhone(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");
  
  // Handle different formats
  if (cleaned.startsWith("233")) {
    return cleaned; // Already in international format
  } else if (cleaned.startsWith("0")) {
    return "233" + cleaned.substring(1); // Convert 0XX to 233XX
  } else if (cleaned.length === 9) {
    return "233" + cleaned; // Add country code
  }
  
  return cleaned;
}

export async function sendSMS({ to, message }: SMSOptions): Promise<SMSResponse> {
  // Check if mNotify is configured
  if (!MNOTIFY_API_KEY) {
    console.log("mNotify not configured. SMS would be sent to:", to);
    console.log("Message:", message);
    return { success: true, error: "SMS logged (mNotify not configured)" };
  }

  try {
    // Handle single or multiple recipients
    const recipients = Array.isArray(to) 
      ? to.map(formatGhanaPhone).join(",")
      : formatGhanaPhone(to);

    const params = new URLSearchParams({
      key: MNOTIFY_API_KEY,
      to: recipients,
      msg: message,
      sender_id: MNOTIFY_SENDER_ID,
    });

    const response = await fetch(`${MNOTIFY_API_URL}?${params.toString()}`, {
      method: "GET",
    });

    const result = await response.text();
    
    // mNotify returns different codes
    // 1000 = Success
    // 1002 = SMS sent but some numbers failed
    // 1003 = Insufficient balance
    // 1004 = Invalid API key
    // 1005 = Invalid phone number
    // 1006 = Invalid sender ID
    // 1007 = Message too long
    // 1008 = Empty message
    
    if (result.includes("1000") || result.includes("1002")) {
      console.log("SMS sent successfully to:", recipients);
      return { success: true, messageId: result };
    } else {
      console.error("SMS failed:", result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error("SMS error:", error);
    return { success: false, error: String(error) };
  }
}

// SMS Templates
export const smsTemplates = {
  orderConfirmationCustomer: (orderNumber: string, total: number) => 
    `Papaye: Your order ${orderNumber} has been confirmed! Total: GH₵${total.toFixed(2)}. We'll notify you when it's ready. Thank you!`,

  orderConfirmationCompany: (orderNumber: string, customerName: string, total: number, phone: string) =>
    `NEW ORDER: ${orderNumber}\nCustomer: ${customerName}\nPhone: ${phone}\nTotal: GH₵${total.toFixed(2)}`,

  orderReady: (orderNumber: string) =>
    `Papaye: Your order ${orderNumber} is ready for pickup! Please come to the counter. Thank you for choosing Papaye!`,

  orderOutForDelivery: (orderNumber: string) =>
    `Papaye: Your order ${orderNumber} is out for delivery! Our rider is on the way. Thank you for your patience!`,

  orderDelivered: (orderNumber: string) =>
    `Papaye: Your order ${orderNumber} has been delivered! Enjoy your meal. We'd love your feedback!`,

  orderCancelled: (orderNumber: string) =>
    `Papaye: Your order ${orderNumber} has been cancelled. If you have questions, please contact us. We apologize for any inconvenience.`,
};

// Send order notifications to both customer and company
export async function sendOrderNotifications(order: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
}) {
  const results = {
    customerSMS: { success: false } as SMSResponse,
    companySMS: { success: false } as SMSResponse,
  };

  // Get company phone from environment
  const companyPhone = process.env.COMPANY_PHONE || process.env.CONTACT_PHONE;

  // Send SMS to customer
  if (order.customerPhone) {
    results.customerSMS = await sendSMS({
      to: order.customerPhone,
      message: smsTemplates.orderConfirmationCustomer(order.orderNumber, order.total),
    });
  }

  // Send SMS to company
  if (companyPhone) {
    results.companySMS = await sendSMS({
      to: companyPhone,
      message: smsTemplates.orderConfirmationCompany(
        order.orderNumber,
        order.customerName,
        order.total,
        order.customerPhone
      ),
    });
  }

  return results;
}

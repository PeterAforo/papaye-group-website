import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt with Papaye context and ordering capability
const SYSTEM_PROMPT = `You are a helpful customer service assistant for Papaye Fast Food, Ghana's pioneer fast food restaurant since 1991. You can help customers place orders, answer questions, and provide information.

ABOUT PAPAYE:
- Ghana's Total Food Care Company since 1991
- 10+ branches across Greater Accra with 600+ staff

COMPLETE MENU WITH ITEM IDs (use these IDs when building orders):
CHICKEN:
- [ID:1] Broasted Chicken Rice with Coleslaw - GHS 80
- [ID:2] Broasted Chicken Chips with Coleslaw - GHS 80
- [ID:3] Grilled Chicken Rice with Coleslaw - GHS 80
- [ID:4] Grilled Chicken Chips with Coleslaw - GHS 80
- [ID:5] Broasted Chicken Rice (no coleslaw) - GHS 77
- [ID:6] Mini Rice with Coleslaw - GHS 40
- [ID:7] Full Chicken - GHS 135

FISH:
- [ID:8] Grilled Fish Rice with Coleslaw - GHS 88
- [ID:9] Grilled Fish Chips with Coleslaw - GHS 88
- [ID:10] Fried Fish Rice with Coleslaw - GHS 88

BURGERS:
- [ID:11] Cheese Egg Burger - GHS 70
- [ID:12] Egg Burger - GHS 70
- [ID:13] Cheese Burger - GHS 65
- [ID:14] Beef Burger - GHS 65

EXTRAS:
- [ID:15] 2pcs Extra Broasted Chicken - GHS 41
- [ID:16] 3pcs Extra Broasted Chicken - GHS 50
- [ID:17] Coleslaw - GHS 10
- [ID:18] French Fries - GHS 20

DRINKS:
- [ID:19] Fresh Juice - GHS 17

BRANCHES:
1. Spintex (Head Office) - +233 302 810 992
2. Osu - +233 302 773 754
3. Tesano - +233 302 232 773
4. Tema - +233 303 219 819
5. Lapaz - +233 302 259 970
6. Awudome - +233 302 267 703
7. Haatso - +233 302 961 581
8. Weija - +233 303 944 646
9. Frafraha - +233 342 295 406
10. East Legon - +233 342 295 420

ORDERING PROCESS - FOLLOW EXACTLY:
Step 1: When customer wants to order, SHOW THEM THE MENU with prices. List the categories and popular items.
Step 2: Let them choose items and confirm quantities  
Step 3: Ask "Delivery or Pickup?"
Step 4: Ask "What is your name?"
Step 5: Ask "What is your phone number?"
Step 6: For delivery ask address, for pickup ask which branch
Step 7: Summarize everything and ask to confirm

IMPORTANT: In Step 1, always display menu options like:
"Here's our menu:
**Chicken Dishes:**
- Broasted Chicken Rice with Coleslaw - GHS 80
- Grilled Chicken Rice with Coleslaw - GHS 80
- Broasted Chicken Chips with Coleslaw - GHS 80

**Fish Dishes:**
- Grilled Fish Rice with Coleslaw - GHS 88
- Grilled Fish Chips with Coleslaw - GHS 88

**Burgers:**
- Cheese Egg Burger - GHS 70
- Chicken Burger - GHS 65

**Drinks:**
- Fresh Orange Juice - GHS 17
- Sobolo - GHS 10

What would you like?"

NEVER SKIP STEPS 4 AND 5 - Customer name and phone are REQUIRED.

When customer says "yes" or "confirm", output EXACTLY this format:
\`\`\`ORDER_CONFIRMED
{"items":[{"id":1,"name":"Item Name","price":80,"quantity":1}],"subtotal":80,"deliveryFee":0,"total":80,"deliveryType":"PICKUP","name":"Customer Name Here","phone":"0241234567","address":null,"branch":"Osu","notes":""}
\`\`\`

IMPORTANT JSON FIELDS:
- "name": The customer's name (REQUIRED - ask if not provided)
- "phone": The customer's phone (REQUIRED - ask if not provided)
- "deliveryType": "DELIVERY" or "PICKUP"
- "address": Delivery address or null for pickup
- "branch": Branch name for pickup or null for delivery
- Delivery fee is GHS 15 for DELIVERY, GHS 0 for PICKUP

GUIDELINES:
- Be friendly, guide step by step
- ALWAYS collect name and phone before confirming
- Calculate totals correctly`;

export async function POST(request: NextRequest) {
  try {
    const { messages, orderContext } = await request.json();

    // Check if online orders are enabled
    const onlineOrdersSetting = await prisma.setting.findUnique({
      where: { key: "onlineOrdersEnabled" },
    });
    
    // Log the setting value for debugging
    console.log("Online orders setting:", onlineOrdersSetting?.value, "Type:", typeof onlineOrdersSetting?.value);
    
    // Check if ordering is enabled - must be explicitly "true" to be enabled
    // If setting doesn't exist or is "false", ordering is disabled
    const onlineOrdersEnabled = onlineOrdersSetting?.value === "true";

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        message: getFallbackResponse(messages[messages.length - 1]?.content || "", onlineOrdersEnabled),
      });
    }

    // Build system prompt with ordering status
    let systemPrompt = SYSTEM_PROMPT;
    if (!onlineOrdersEnabled) {
      // Replace the entire ordering section with a disabled message
      systemPrompt = `You are a helpful customer service assistant for Papaye Fast Food, Ghana's pioneer fast food restaurant since 1991. You can answer questions about our menu, prices, and branch locations.

ABOUT PAPAYE:
- Ghana's Total Food Care Company since 1991
- 10+ branches across Greater Accra with 600+ staff

BRANCHES:
1. Spintex (Head Office) - +233 302 810 992
2. Osu - +233 302 773 754
3. Tesano - +233 302 232 773
4. Tema - +233 303 219 819
5. Lapaz - +233 302 259 970
6. Awudome - +233 302 267 703
7. Haatso - +233 302 961 581
8. Weija - +233 303 944 646
9. Frafraha - +233 342 295 406
10. East Legon - +233 342 295 420

CRITICAL INSTRUCTION - ONLINE ORDERING IS DISABLED:
Online ordering is currently DISABLED. You CANNOT take orders, show order menus, or process any orders through this chat.

If a customer says they want to order, wants food, or anything related to placing an order, you MUST respond with:
"I'm sorry, but online ordering is temporarily unavailable at the moment. However, you can still enjoy our delicious food by:
• Visiting any of our 10+ branches across Accra
• Calling our head office at +233 302 810 990
• Calling your nearest branch directly

We apologize for any inconvenience and look forward to serving you!"

Do NOT show menu prices, do NOT start the ordering process, do NOT ask what they want to order. Just redirect them to visit or call.

You CAN still help with:
- General questions about Papaye
- Branch locations and phone numbers
- Operating hours
- General menu information (without taking orders)`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-15),
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const responseMessage = completion.choices[0]?.message?.content || 
      "I apologize, but I couldn't process your request. Please try again.";

    // Check if the response contains a confirmed order (only process if ordering is enabled)
    const orderMatch = responseMessage.match(/```ORDER_CONFIRMED\n([\s\S]*?)\n```/);
    
    if (orderMatch && onlineOrdersEnabled) {
      try {
        const orderData = JSON.parse(orderMatch[1]);
        
        // Log the order data for debugging
        console.log("Order data received:", JSON.stringify(orderData, null, 2));
        
        // Create the order in the database
        const order = await createOrder(orderData);
        
        // Return the message without the JSON block, plus order confirmation
        const cleanMessage = responseMessage.replace(/```ORDER_CONFIRMED\n[\s\S]*?\n```/, '').trim();
        
        return NextResponse.json({ 
          message: cleanMessage + `\n\n✅ **Order Confirmed!**\nYour order number is: **${order.orderNumber}**\n\nWe'll prepare your order right away. ${orderData.deliveryType === 'DELIVERY' ? 'Our delivery team will contact you shortly.' : `Please pick up at our ${orderData.branchId} branch.`}\n\nThank you for choosing Papaye! 🍗`,
          orderPlaced: true,
          orderNumber: order.orderNumber,
          orderDetails: orderData
        });
      } catch (parseError) {
        console.error("Order parsing error:", parseError);
      }
    }

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error("Chat API error:", error);
    
    return NextResponse.json({
      message: "I'm having trouble connecting right now. Please call +233 302 810 990 for assistance.",
    });
  }
}

async function createOrder(orderData: any) {
  // Generate order number
  const orderNumber = `PAP${Date.now().toString().slice(-8)}`;
  
  // Calculate totals
  const subtotal = orderData.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const deliveryFee = orderData.deliveryType === 'DELIVERY' ? 15 : 0;
  const total = subtotal + deliveryFee;

  // Extract customer details with fallbacks for various field names AI might use
  const customerName = orderData.name || orderData.customerName || orderData.customer_name || orderData.customer || null;
  const customerPhone = orderData.phone || orderData.customerPhone || orderData.customer_phone || orderData.telephone || orderData.tel || null;

  // Get branch name from order data
  const branchName = orderData.branch || orderData.branchId || orderData.branchName || null;
  
  // Look up branch ID from branch name if provided
  let branchId = null;
  if (branchName && orderData.deliveryType === 'PICKUP') {
    const branch = await prisma.branch.findFirst({
      where: {
        name: {
          contains: branchName,
          mode: 'insensitive',
        },
        isActive: true,
      },
      select: { id: true },
    });
    branchId = branch?.id || null;
  }

  // Build order items description for notes
  const itemsDescription = orderData.items
    .map((item: any) => `${item.quantity}x ${item.name} @ GHS ${item.price}`)
    .join(', ');

  // Build comprehensive notes including customer info
  const noteParts = [
    `Items: ${itemsDescription}`,
    orderData.deliveryType === 'DELIVERY' ? `Delivery to: ${orderData.address || orderData.deliveryAddress}` : `Pickup at: ${branchName}`,
    customerName ? `Customer: ${customerName}` : null,
    customerPhone ? `Phone: ${customerPhone}` : null,
    orderData.notes ? `Notes: ${orderData.notes}` : null,
  ].filter(Boolean).join(' | ');

  // Create order in database
  const order = await prisma.order.create({
    data: {
      orderNumber,
      branchId,
      subtotal,
      deliveryFee,
      total,
      status: "PENDING",
      paymentMethod: "CASH",
      paymentStatus: "PENDING",
      deliveryType: orderData.deliveryType || "PICKUP",
      guestName: customerName,
      guestPhone: customerPhone,
      guestEmail: null,
      notes: noteParts,
    },
  });

  console.log("Order created:", order.orderNumber, "Customer:", customerName, "Phone:", customerPhone, "Branch:", branchId);

  return order;
}

// Fallback responses when OpenAI is not available
function getFallbackResponse(userMessage: string, onlineOrdersEnabled: boolean = true): string {
  const message = userMessage.toLowerCase();

  if (message.includes("menu") || message.includes("food") || message.includes("eat")) {
    return "Our menu features delicious broasted and grilled chicken (GHS 80), fish dishes (GHS 88), burgers (GHS 65-70), and fresh juices (GHS 17). Visit our Menu page to see all options, or visit any of our 10+ branches across Accra!";
  }

  if (message.includes("price") || message.includes("cost") || message.includes("how much")) {
    return "Our prices range from GHS 10 for coleslaw to GHS 135 for a full chicken. Popular meals like Broasted Chicken Rice with Coleslaw are GHS 80. Check our full menu for all prices!";
  }

  if (message.includes("branch") || message.includes("location") || message.includes("where") || message.includes("address")) {
    return "We have 10+ branches across Greater Accra! Our head office is at Spintex Road (+233 302 810 992). Other locations include Osu, Tesano, Tema, Lapaz, Awudome, Haatso, Weija, Frafraha, and East Legon. Visit our Branches page for full details!";
  }

  if (message.includes("hour") || message.includes("open") || message.includes("close") || message.includes("time")) {
    return "Most of our branches are open from 7:00 AM to 11:00 PM daily. Some locations may have slightly different hours. Call ahead to confirm!";
  }

  if (message.includes("contact") || message.includes("phone") || message.includes("call")) {
    return "You can reach our head office at +233 302 810 990 or email info@papayegroup.com. Each branch also has its own phone number - check our Branches page for details!";
  }

  if (message.includes("order") || message.includes("delivery") || message.includes("takeaway")) {
    if (!onlineOrdersEnabled) {
      return "I'm sorry, but online ordering is temporarily unavailable. You can place orders by calling any of our branches directly or visiting in person. Our head office number is +233 302 810 990. We apologize for any inconvenience!";
    }
    return "You can place orders by calling any of our branches directly or visiting in person. For the nearest branch, check our Branches page. Our head office number is +233 302 810 990.";
  }

  if (message.includes("chicken")) {
    return "Our signature broasted and grilled chicken dishes are customer favorites! Broasted or Grilled Chicken with Rice and Coleslaw is GHS 80. A Full Chicken is GHS 135. All prepared fresh with our special seasoning!";
  }

  if (message.includes("fish")) {
    return "We serve delicious grilled and fried fish! Grilled Fish Rice with Coleslaw is GHS 88. Our fish is always fresh and prepared with traditional Ghanaian spices.";
  }

  if (message.includes("burger")) {
    return "Our burgers are juicy and delicious! Cheese Egg Burger is GHS 70, Cheese Burger is GHS 65, and Beef Burger is GHS 65. All served with fresh vegetables!";
  }

  if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
    return "Hello! Welcome to Papaye Fast Food - Ghana's Total Food Care Company since 1991. How can I help you today? I can assist with menu information, branch locations, or any questions about our services!";
  }

  if (message.includes("thank")) {
    return "You're welcome! Thank you for choosing Papaye. We look forward to serving you at any of our branches. Have a great day! 🍗";
  }

  return "Thank you for your message! I can help you with information about our menu, branch locations, operating hours, and more. What would you like to know about Papaye Fast Food?";
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  MessageSquare,
  Users,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Megaphone,
  Sparkles,
  Target,
  BarChart3,
  Clock,
  Zap,
  Code,
  Eye,
  Plus,
  X,
  UtensilsCrossed,
  ShoppingBag,
} from "lucide-react";

interface CampaignStats {
  totalUsers: number;
  totalNewsletterSubscribers: number;
  totalGuestContacts: number;
  totalUniqueEmails: number;
  totalPhoneNumbers: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string | null;
  description: string | null;
  category: string;
}

type CampaignType = "email" | "sms" | "both";
type TargetAudience = "all" | "users" | "newsletter" | "guests";
type EditorMode = "simple" | "html";

export default function CampaignsPage() {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form state
  const [campaignType, setCampaignType] = useState<CampaignType>("email");
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [editorMode, setEditorMode] = useState<EditorMode>("simple");
  const [htmlContent, setHtmlContent] = useState("");
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  const [showMenuPicker, setShowMenuPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/campaigns");
      const data = await response.json();
      setStats(data.stats);
      setMenuItems(data.menuItems || []);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate HTML email with menu items
  const generateMenuHtml = (items: MenuItem[]) => {
    return items.map(item => `
      <div style="display: inline-block; width: 45%; margin: 10px 2%; vertical-align: top; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 150px; object-fit: cover;" />` : ''}
        <div style="padding: 15px;">
          <h3 style="margin: 0 0 5px 0; color: #333;">${item.name}</h3>
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">${item.description || ''}</p>
          <p style="margin: 0; color: #E50000; font-weight: bold; font-size: 18px;">GH₵ ${item.price.toFixed(2)}</p>
        </div>
      </div>
    `).join('');
  };

  const generateFullHtml = () => {
    const selectedItems = menuItems.filter(m => selectedMenuItems.includes(m.id));
    const menuSection = selectedItems.length > 0 ? `
      <div style="margin: 30px 0;">
        <h2 style="text-align: center; color: #333; margin-bottom: 20px;">🍗 Featured Menu Items</h2>
        <div style="text-align: center;">
          ${generateMenuHtml(selectedItems)}
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://papayegroup.com'}/menu" style="background: #E50000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Full Menu</a>
        </div>
      </div>
    ` : '';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
        <div style="background: #E50000; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Papaye</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Ghana's Favorite Fast Food</p>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; line-height: 1.6;">Hi {name},</p>
          ${message.replace(/\n/g, "<br>")}
          ${menuSection}
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} Papaye Restaurant. All rights reserved.</p>
          <p style="margin: 0;"><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://papayegroup.com'}/unsubscribe" style="color: #999;">Unsubscribe</a></p>
        </div>
      </div>
    `;
  };

  const handleSendCampaign = async () => {
    const content = editorMode === "html" ? htmlContent : message;
    if (!content.trim()) {
      setResult({ success: false, message: "Please enter a message" });
      return;
    }

    if ((campaignType === "email" || campaignType === "both") && !subject.trim()) {
      setResult({ success: false, message: "Please enter an email subject" });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const finalHtml = editorMode === "html" ? htmlContent : generateFullHtml();
      
      const response = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: campaignType,
          subject,
          message: campaignType === "sms" || campaignType === "both" ? message : undefined,
          htmlContent: campaignType === "email" || campaignType === "both" ? finalHtml : undefined,
          targetAudience,
          selectedMenuItems,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send campaign");
      }

      setResult({ success: true, message: data.message });
      setSubject("");
      setMessage("");
      setHtmlContent("");
      setSelectedMenuItems([]);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to send campaign",
      });
    } finally {
      setSending(false);
    }
  };

  const getRecipientCount = () => {
    if (!stats) return 0;
    switch (targetAudience) {
      case "all":
        return campaignType === "sms" ? stats.totalPhoneNumbers : stats.totalUniqueEmails;
      case "users":
        return stats.totalUsers;
      case "newsletter":
        return stats.totalNewsletterSubscribers;
      case "guests":
        return stats.totalGuestContacts || 0;
      default:
        return 0;
    }
  };

  const toggleMenuItem = (id: string) => {
    setSelectedMenuItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const campaignTypes = [
    { id: "email" as CampaignType, label: "Email Only", icon: Mail, color: "bg-blue-500" },
    { id: "sms" as CampaignType, label: "SMS Only", icon: MessageSquare, color: "bg-green-500" },
    { id: "both" as CampaignType, label: "Email + SMS", icon: Zap, color: "bg-purple-500" },
  ];

  const audiences = [
    { id: "all" as TargetAudience, label: "All Contacts", description: "Users + Newsletter + Guests" },
    { id: "users" as TargetAudience, label: "Registered Users", description: "Only registered accounts" },
    { id: "newsletter" as TargetAudience, label: "Newsletter Subscribers", description: "Email subscribers only" },
    { id: "guests" as TargetAudience, label: "Guest Customers", description: "Customers who ordered without signing up" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-primary" />
            Marketing Campaigns
          </h1>
          <p className="text-gray-600 mt-1">Send bulk emails and SMS to your customers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Users</p>
                  <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                </div>
                <Users className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Newsletter Subs</p>
                  <p className="text-3xl font-bold">{stats?.totalNewsletterSubscribers || 0}</p>
                </div>
                <Mail className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Unique Emails</p>
                  <p className="text-3xl font-bold">{stats?.totalUniqueEmails || 0}</p>
                </div>
                <Target className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Phone Numbers</p>
                  <p className="text-3xl font-bold">{stats?.totalPhoneNumbers || 0}</p>
                </div>
                <MessageSquare className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Campaign Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings */}
        <div className="space-y-6">
          {/* Campaign Type */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Campaign Type
              </h3>
              <div className="space-y-3">
                {campaignTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setCampaignType(type.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      campaignType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`${type.color} p-2 rounded-lg`}>
                      <type.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">{type.label}</span>
                    {campaignType === type.id && (
                      <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Target Audience */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Target Audience
              </h3>
              <div className="space-y-3">
                {audiences.map((audience) => (
                  <button
                    key={audience.id}
                    onClick={() => setTargetAudience(audience.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      targetAudience === audience.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{audience.label}</span>
                      {targetAudience === audience.id && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{audience.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recipient Preview */}
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                Recipients Preview
              </h3>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-primary">{getRecipientCount()}</p>
                <p className="text-gray-600 text-sm mt-1">
                  {campaignType === "sms" ? "phone numbers" : "email addresses"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Message Composer */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Compose Message
                </h3>
                {(campaignType === "email" || campaignType === "both") && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditorMode("simple")}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                        editorMode === "simple" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Simple
                    </button>
                    <button
                      onClick={() => setEditorMode("html")}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                        editorMode === "html" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <Code className="w-4 h-4" />
                      HTML
                    </button>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 bg-gray-100 hover:bg-gray-200"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                )}
              </div>

              {/* Subject (for email) */}
              {(campaignType === "email" || campaignType === "both") && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., 🍗 Special Offer Just for You!"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              )}

              {/* Message Editor */}
              {editorMode === "simple" ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Hi {name},\n\nWe have an exciting offer for you!\n\n🍗 Get 20% off your next order with code PAPAYE20\n\nOrder now at papayegroup.com\n\nBest regards,\nThe Papaye Team`}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    💡 Use <code className="bg-gray-100 px-1 rounded">{"{name}"}</code> to personalize with customer&apos;s name
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HTML Content
                  </label>
                  <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder={`<div style="font-family: Arial, sans-serif;">
  <h1>Hello {name}!</h1>
  <p>Your custom HTML email content here...</p>
</div>`}
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm"
                  />
                </div>
              )}

              {/* SMS Message (when both selected) */}
              {campaignType === "both" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMS Message (separate from email)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Short SMS message..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ SMS: {message.length}/160 characters
                  </p>
                </div>
              )}

              {campaignType === "sms" && (
                <p className="text-sm text-orange-600 mb-4">
                  ⚠️ SMS messages are limited to 160 characters. Current: {message.length}/160
                </p>
              )}

              {/* Menu Items Picker (for email) */}
              {(campaignType === "email" || campaignType === "both") && editorMode === "simple" && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4" />
                      Add Menu Items to Email
                    </label>
                    <button
                      onClick={() => setShowMenuPicker(!showMenuPicker)}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {showMenuPicker ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {showMenuPicker ? "Close" : "Select Items"}
                    </button>
                  </div>

                  {/* Selected Items */}
                  {selectedMenuItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedMenuItems.map(id => {
                        const item = menuItems.find(m => m.id === id);
                        return item ? (
                          <span key={id} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            {item.name}
                            <button onClick={() => toggleMenuItem(id)} className="hover:text-red-500">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Menu Picker Grid */}
                  {showMenuPicker && (
                    <div className="border rounded-xl p-4 max-h-64 overflow-y-auto bg-gray-50">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {menuItems.map(item => (
                          <button
                            key={item.id}
                            onClick={() => toggleMenuItem(item.id)}
                            className={`p-2 rounded-lg text-left text-sm border transition-all ${
                              selectedMenuItems.includes(item.id)
                                ? "border-primary bg-primary/10"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {selectedMenuItems.includes(item.id) && (
                                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="font-medium truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">GH₵{item.price.toFixed(2)}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Email Preview */}
              {showPreview && (campaignType === "email" || campaignType === "both") && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Preview</label>
                  <div className="border rounded-xl overflow-hidden bg-white">
                    <div
                      className="p-4"
                      dangerouslySetInnerHTML={{
                        __html: editorMode === "html" ? htmlContent : generateFullHtml().replace(/\{name\}/g, "John"),
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Result Message */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl mb-4 flex items-start gap-3 ${
                    result.success
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <p>{result.message}</p>
                </motion.div>
              )}

              {/* Send Button */}
              <Button
                onClick={handleSendCampaign}
                disabled={sending || (editorMode === "simple" ? !message.trim() : !htmlContent.trim())}
                className="w-full py-6 text-lg"
                size="lg"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending Campaign...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Campaign to {getRecipientCount()} Recipients
                  </>
                )}
              </Button>

              {/* Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-medium text-blue-800 mb-2">📌 Campaign Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Add menu items to showcase your best dishes in emails</li>
                  <li>• Use emojis to make your messages more engaging 🎉</li>
                  <li>• Include promo codes for easy tracking</li>
                  <li>• Best times to send: 10am-12pm or 6pm-8pm</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Templates */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Quick Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setSubject("🍗 Special Weekend Offer!");
                setMessage("Hi {name},\n\nThis weekend only! Get 25% off all chicken meals.\n\nUse code: WEEKEND25\n\nOrder now at papayegroup.com\n\nSee you soon!\nThe Papaye Team");
              }}
              className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left"
            >
              <span className="text-2xl">🎉</span>
              <p className="font-medium mt-2">Weekend Special</p>
              <p className="text-sm text-gray-500">25% off promotion</p>
            </button>

            <button
              onClick={() => {
                setSubject("🆕 New Menu Items at Papaye!");
                setMessage("Hi {name},\n\nExciting news! We've added delicious new items to our menu.\n\n🍔 Spicy Chicken Burger\n🍟 Loaded Fries\n🥤 Fresh Smoothies\n\nBe the first to try them!\n\nOrder at papayegroup.com\n\nThe Papaye Team");
              }}
              className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left"
            >
              <span className="text-2xl">🆕</span>
              <p className="font-medium mt-2">New Menu Launch</p>
              <p className="text-sm text-gray-500">Announce new items</p>
            </button>

            <button
              onClick={() => {
                setSubject("❤️ We Miss You!");
                setMessage("Hi {name},\n\nIt's been a while since your last visit!\n\nWe'd love to see you again. Here's 15% off your next order as a welcome back gift.\n\nUse code: MISSYOU15\n\nValid for 7 days.\n\nWarm regards,\nThe Papaye Team");
              }}
              className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left"
            >
              <span className="text-2xl">❤️</span>
              <p className="font-medium mt-2">Win-Back Campaign</p>
              <p className="text-sm text-gray-500">Re-engage customers</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

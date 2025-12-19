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
} from "lucide-react";

interface CampaignStats {
  totalUsers: number;
  totalNewsletterSubscribers: number;
  totalUniqueEmails: number;
  totalPhoneNumbers: number;
}

type CampaignType = "email" | "sms" | "both";
type TargetAudience = "all" | "users" | "newsletter" | "custom";

export default function CampaignsPage() {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form state
  const [campaignType, setCampaignType] = useState<CampaignType>("email");
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/campaigns");
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!message.trim()) {
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
      const response = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: campaignType,
          subject,
          message,
          targetAudience,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send campaign");
      }

      setResult({ success: true, message: data.message });
      // Clear form on success
      setSubject("");
      setMessage("");
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
        return campaignType === "sms" ? stats.totalPhoneNumbers : stats.totalUsers;
      case "newsletter":
        return stats.totalNewsletterSubscribers;
      default:
        return 0;
    }
  };

  const campaignTypes = [
    { id: "email" as CampaignType, label: "Email Only", icon: Mail, color: "bg-blue-500" },
    { id: "sms" as CampaignType, label: "SMS Only", icon: MessageSquare, color: "bg-green-500" },
    { id: "both" as CampaignType, label: "Email + SMS", icon: Zap, color: "bg-purple-500" },
  ];

  const audiences = [
    { id: "all" as TargetAudience, label: "All Contacts", description: "Users + Newsletter subscribers" },
    { id: "users" as TargetAudience, label: "Registered Users", description: "Only registered accounts" },
    { id: "newsletter" as TargetAudience, label: "Newsletter Subscribers", description: "Email subscribers only" },
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
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Compose Message
              </h3>

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

              {/* Message */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Content
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hi {name},\n\nWe have an exciting offer for you!\n\n🍗 Get 20% off your next order with code PAPAYE20\n\nOrder now at papayegroup.com\n\nBest regards,\nThe Papaye Team`}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  💡 Use <code className="bg-gray-100 px-1 rounded">{"{name}"}</code> to personalize with customer&apos;s name
                </p>
                {campaignType === "sms" && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ SMS messages are limited to 160 characters. Current: {message.length}/160
                  </p>
                )}
              </div>

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
                disabled={sending || !message.trim()}
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
                  <li>• Keep SMS messages short and include a clear call-to-action</li>
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

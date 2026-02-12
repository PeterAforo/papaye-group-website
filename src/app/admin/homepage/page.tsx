"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  Save,
  Loader2,
  Home,
  Star,
  Users,
  MessageSquare,
  Megaphone,
  Image as ImageIcon,
  Phone,
} from "lucide-react";

interface HomepageSection {
  id?: string;
  section: string;
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  metadata: string;
}

const defaultSections: Record<string, HomepageSection> = {
  hero: {
    section: "hero",
    title: "Taste The|Authentic|Ghanaian Flavor",
    subtitle: "From crispy fried chicken to the famous Jollof rice, experience the best of Ghanaian cuisine with a modern twist.",
    content: "",
    imageUrl: "/images/hero-chicken.png",
    buttonText: "Order Now",
    buttonLink: "/menu",
    isActive: true,
    metadata: JSON.stringify({
      badgeText: "🔥 Ghana's #1 Fast Food Chain",
      videoUrl: "https://www.youtube.com/embed/kBO9T7gwk4g",
      stat1Value: "33+",
      stat1Label: "Years Experience",
      stat2Value: "600+",
      stat2Label: "Staff Members",
      stat3Value: "10+",
      stat3Label: "Locations",
    }),
  },
  features: {
    section: "features",
    title: "Why Choose Papaye?",
    subtitle: "We're committed to quality, taste, and service",
    content: "",
    imageUrl: "",
    buttonText: "",
    buttonLink: "",
    isActive: true,
    metadata: JSON.stringify({
      items: [
        { icon: "ChefHat", title: "Fresh Ingredients", description: "We use only the freshest, locally-sourced ingredients" },
        { icon: "Clock", title: "Fast Delivery", description: "Hot food delivered to your door in 30 minutes or less" },
        { icon: "Award", title: "Award Winning", description: "Recognized as Ghana's best fast food since 1991" },
      ],
    }),
  },
  popular: {
    section: "popular",
    title: "Most Popular",
    subtitle: "Our customers' favorites that keep them coming back",
    content: "",
    imageUrl: "",
    buttonText: "View Full Menu",
    buttonLink: "/menu",
    isActive: true,
    metadata: "",
  },
  about: {
    section: "about",
    title: "Our Story",
    subtitle: "A legacy of taste since 1991",
    content: "Founded in 1991, Papaye has been serving the finest fast food in Ghana for over three decades. What started as a small restaurant has grown into a beloved chain, known for our crispy fried chicken and delicious local dishes.",
    imageUrl: "/images/about-restaurant.jpg",
    buttonText: "Learn More",
    buttonLink: "/about",
    isActive: true,
    metadata: "",
  },
  testimonials: {
    section: "testimonials",
    title: "What Our Customers Say",
    subtitle: "Don't just take our word for it",
    content: "",
    imageUrl: "",
    buttonText: "",
    buttonLink: "",
    isActive: true,
    metadata: JSON.stringify({
      items: [
        { name: "Kwame Asante", role: "Food Blogger", content: "The best fried chicken in Accra! Crispy on the outside, juicy on the inside.", rating: 5 },
        { name: "Ama Serwaa", role: "Regular Customer", content: "I've been coming here for 10 years. The jollof rice is unmatched!", rating: 5 },
      ],
    }),
  },
  cta: {
    section: "cta",
    title: "Ready to Order?",
    subtitle: "Get your favorite meals delivered to your doorstep",
    content: "",
    imageUrl: "",
    buttonText: "Order Now",
    buttonLink: "/menu",
    isActive: true,
    metadata: "",
  },
  newsletter: {
    section: "newsletter",
    title: "Stay Updated",
    subtitle: "Subscribe to our newsletter for exclusive offers and updates",
    content: "",
    imageUrl: "",
    buttonText: "Subscribe",
    buttonLink: "",
    isActive: true,
    metadata: "",
  },
  contact: {
    section: "contact",
    title: "Contact Information",
    subtitle: "Company contact details displayed across the website",
    content: "",
    imageUrl: "",
    buttonText: "",
    buttonLink: "",
    isActive: true,
    metadata: JSON.stringify({
      phone: "+233 302 810 990",
      phone2: "",
      email: "info@papayegroup.com",
      address: "Head Office: Plot 53A, Spintex Road, Opp. Stanbic Bank, Accra",
      hours: "7:00 AM - 11:00 PM",
    }),
  },
};

const sectionTabs = [
  { id: "hero", label: "Hero", icon: Home },
  { id: "contact", label: "Contact Info", icon: Phone },
  { id: "features", label: "Features", icon: Star },
  { id: "popular", label: "Popular", icon: Star },
  { id: "about", label: "About", icon: Users },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare },
  { id: "cta", label: "CTA", icon: Megaphone },
  { id: "newsletter", label: "Newsletter", icon: MessageSquare },
];

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<Record<string, HomepageSection>>(defaultSections);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch("/api/admin/homepage");
      const data = await response.json();
      
      // Merge with defaults
      const merged = { ...defaultSections };
      data.forEach((section: HomepageSection) => {
        merged[section.section] = {
          ...defaultSections[section.section],
          ...section,
        };
      });
      
      setSections(merged);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: Object.values(sections) }),
      });

      if (!response.ok) throw new Error("Failed to save");
      alert("Homepage content saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (section: string, updates: Partial<HomepageSection>) => {
    setSections((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
  };

  const currentSection = sections[activeTab];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Homepage Content</h1>
          <p className="text-gray-600">Manage all sections of the homepage</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Save All Changes
        </Button>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto pb-px">
        {sectionTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section Editor */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-heading capitalize">
                {activeTab} Section
              </h2>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentSection.isActive}
                  onChange={(e) => updateSection(activeTab, { isActive: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">Active</span>
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={currentSection.title}
                  onChange={(e) => updateSection(activeTab, { title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={currentSection.subtitle}
                  onChange={(e) => updateSection(activeTab, { subtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {(activeTab === "about" || activeTab === "hero") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={currentSection.content}
                  onChange={(e) => updateSection(activeTab, { content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            {(activeTab === "hero" || activeTab === "about") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Section Image
                </label>
                <ImageUpload
                  value={currentSection.imageUrl}
                  onChange={(url) => updateSection(activeTab, { imageUrl: url })}
                  folder="homepage"
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={currentSection.buttonText}
                  onChange={(e) => updateSection(activeTab, { buttonText: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Order Now"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Link
                </label>
                <input
                  type="text"
                  value={currentSection.buttonLink}
                  onChange={(e) => updateSection(activeTab, { buttonLink: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., /menu"
                />
              </div>
            </div>

            {/* Features Section - Custom Items */}
            {activeTab === "features" && (
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Feature Items</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Feature items are managed through the code. Contact your developer to modify them.
                </p>
              </div>
            )}

            {/* Testimonials Section - Custom Items */}
            {activeTab === "testimonials" && (
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Testimonials</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Testimonials are pulled from customer reviews. Manage them in the Reviews section.
                </p>
              </div>
            )}

            {/* Hero Section - Extended Fields */}
            {activeTab === "hero" && (
              <div className="border-t pt-6 space-y-6">
                <h3 className="font-medium mb-4">Hero Section Details</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Title format: Use | to separate lines (e.g., "Taste The|Authentic|Ghanaian Flavor")
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={(() => {
                        try {
                          return JSON.parse(currentSection.metadata || "{}").badgeText || "";
                        } catch { return ""; }
                      })()}
                      onChange={(e) => {
                        const meta = JSON.parse(currentSection.metadata || "{}");
                        meta.badgeText = e.target.value;
                        updateSection(activeTab, { metadata: JSON.stringify(meta) });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="🔥 Ghana's #1 Fast Food Chain"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video URL (YouTube Embed)
                    </label>
                    <input
                      type="text"
                      value={(() => {
                        try {
                          return JSON.parse(currentSection.metadata || "{}").videoUrl || "";
                        } catch { return ""; }
                      })()}
                      onChange={(e) => {
                        const meta = JSON.parse(currentSection.metadata || "{}");
                        meta.videoUrl = e.target.value;
                        updateSection(activeTab, { metadata: JSON.stringify(meta) });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://www.youtube.com/embed/..."
                    />
                  </div>
                </div>

                <h4 className="font-medium mt-6">Statistics</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="space-y-2">
                      <input
                        type="text"
                        value={(() => {
                          try {
                            return JSON.parse(currentSection.metadata || "{}")[`stat${num}Value`] || "";
                          } catch { return ""; }
                        })()}
                        onChange={(e) => {
                          const meta = JSON.parse(currentSection.metadata || "{}");
                          meta[`stat${num}Value`] = e.target.value;
                          updateSection(activeTab, { metadata: JSON.stringify(meta) });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={`Stat ${num} Value (e.g., 33+)`}
                      />
                      <input
                        type="text"
                        value={(() => {
                          try {
                            return JSON.parse(currentSection.metadata || "{}")[`stat${num}Label`] || "";
                          } catch { return ""; }
                        })()}
                        onChange={(e) => {
                          const meta = JSON.parse(currentSection.metadata || "{}");
                          meta[`stat${num}Label`] = e.target.value;
                          updateSection(activeTab, { metadata: JSON.stringify(meta) });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={`Stat ${num} Label (e.g., Years Experience)`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Section - Phone, Email, Address */}
            {activeTab === "contact" && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    These contact details are displayed in the header, footer, and contact page across the website.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Phone Number
                    </label>
                    <input
                      type="text"
                      value={(() => {
                        try {
                          return JSON.parse(currentSection.metadata || "{}").phone || "";
                        } catch { return ""; }
                      })()}
                      onChange={(e) => {
                        const meta = JSON.parse(currentSection.metadata || "{}");
                        meta.phone = e.target.value;
                        updateSection(activeTab, { metadata: JSON.stringify(meta) });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="+233 302 810 990"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={(() => {
                        try {
                          return JSON.parse(currentSection.metadata || "{}").phone2 || "";
                        } catch { return ""; }
                      })()}
                      onChange={(e) => {
                        const meta = JSON.parse(currentSection.metadata || "{}");
                        meta.phone2 = e.target.value;
                        updateSection(activeTab, { metadata: JSON.stringify(meta) });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="+233 XXX XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={(() => {
                      try {
                        return JSON.parse(currentSection.metadata || "{}").email || "";
                      } catch { return ""; }
                    })()}
                    onChange={(e) => {
                      const meta = JSON.parse(currentSection.metadata || "{}");
                      meta.email = e.target.value;
                      updateSection(activeTab, { metadata: JSON.stringify(meta) });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="info@papayegroup.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Head Office Address
                  </label>
                  <textarea
                    value={(() => {
                      try {
                        return JSON.parse(currentSection.metadata || "{}").address || "";
                      } catch { return ""; }
                    })()}
                    onChange={(e) => {
                      const meta = JSON.parse(currentSection.metadata || "{}");
                      meta.address = e.target.value;
                      updateSection(activeTab, { metadata: JSON.stringify(meta) });
                    }}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Head Office: Plot 53A, Spintex Road, Opp. Stanbic Bank, Accra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Hours
                  </label>
                  <input
                    type="text"
                    value={(() => {
                      try {
                        return JSON.parse(currentSection.metadata || "{}").hours || "";
                      } catch { return ""; }
                    })()}
                    onChange={(e) => {
                      const meta = JSON.parse(currentSection.metadata || "{}");
                      meta.hours = e.target.value;
                      updateSection(activeTab, { metadata: JSON.stringify(meta) });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="7:00 AM - 11:00 PM"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

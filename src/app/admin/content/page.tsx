"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Save,
  Loader2,
  FileText,
  Image as ImageIcon,
  Home,
  Info,
  Camera,
  Phone,
} from "lucide-react";

interface PageContent {
  id: string;
  page: string;
  section: string;
  title: string;
  content: string;
  imageUrl?: string;
}

const pages = [
  { id: "home", label: "Home Page", icon: Home },
  { id: "about", label: "About Us", icon: Info },
  { id: "gallery", label: "Gallery", icon: Camera },
  { id: "contact", label: "Contact", icon: Phone },
];

export default function AdminContentPage() {
  const [contents, setContents] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePage, setActivePage] = useState("home");
  
  const [formData, setFormData] = useState<Record<string, any>>({
    // Home page
    home_hero_title: "Taste the Best of Ghana",
    home_hero_subtitle: "Experience authentic Ghanaian flavors with our signature fried chicken, jollof rice, and more.",
    home_hero_image: "/images/hero-chicken.png",
    home_cta_title: "Ready to Order?",
    home_cta_subtitle: "Get your favorite meals delivered to your doorstep",
    
    // About page
    about_hero_title: "Our Story",
    about_hero_subtitle: "A legacy of taste since 1991",
    about_story_title: "The Papaye Journey",
    about_story_content: "Founded in 1991, Papaye started as a small restaurant with a big dream - to serve the best fast food in Ghana. Today, we've grown into one of the most beloved restaurant chains in the country, known for our crispy fried chicken, flavorful jollof rice, and warm hospitality.",
    about_mission_title: "Our Mission",
    about_mission_content: "To provide delicious, quality food at affordable prices while maintaining the highest standards of hygiene and customer service.",
    about_vision_title: "Our Vision",
    about_vision_content: "To be the leading fast food restaurant chain in West Africa, bringing joy to millions through great food.",
    
    // Gallery
    gallery_title: "Our Gallery",
    gallery_subtitle: "Take a visual journey through our restaurants and dishes",
    
    // Contact
    contact_title: "Get in Touch",
    contact_subtitle: "We'd love to hear from you",
    contact_address: "Osu, Oxford Street, Accra, Ghana",
    contact_phone: "+233 30 123 4567",
    contact_email: "info@papaye.com.gh",
    contact_hours: "Monday - Sunday: 7:00 AM - 10:00 PM",
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch("/api/admin/content");
      const data = await response.json();
      
      // Merge fetched content with defaults
      const merged = { ...formData };
      data.forEach((item: PageContent) => {
        const key = `${item.page}_${item.section}`;
        merged[key] = item.content;
      });
      
      setFormData(merged);
      setContents(data);
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: activePage, content: formData }),
      });

      if (!response.ok) throw new Error("Failed to save");
      alert("Content saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-3xl font-bold font-heading">Content Management</h1>
          <p className="text-gray-600">Edit page content and images</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Page Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activePage === page.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <page.icon className="w-4 h-4" />
            {page.label}
          </button>
        ))}
      </div>

      {/* Home Page Content */}
      {activePage === "home" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-bold font-heading">Hero Section</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={formData.home_hero_title}
                    onChange={(e) => setFormData({ ...formData, home_hero_title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Subtitle
                  </label>
                  <textarea
                    value={formData.home_hero_subtitle}
                    onChange={(e) => setFormData({ ...formData, home_hero_subtitle: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.home_hero_image}
                    onChange={(e) => setFormData({ ...formData, home_hero_image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="/images/hero-chicken.png"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-bold font-heading">CTA Section</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CTA Title
                  </label>
                  <input
                    type="text"
                    value={formData.home_cta_title}
                    onChange={(e) => setFormData({ ...formData, home_cta_title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CTA Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.home_cta_subtitle}
                    onChange={(e) => setFormData({ ...formData, home_cta_subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* About Page Content */}
      {activePage === "about" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-bold font-heading">Hero Section</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={formData.about_hero_title}
                    onChange={(e) => setFormData({ ...formData, about_hero_title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.about_hero_subtitle}
                    onChange={(e) => setFormData({ ...formData, about_hero_subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-bold font-heading">Our Story</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={formData.about_story_title}
                    onChange={(e) => setFormData({ ...formData, about_story_title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Content
                  </label>
                  <textarea
                    value={formData.about_story_content}
                    onChange={(e) => setFormData({ ...formData, about_story_content: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-bold font-heading">Mission & Vision</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mission Title
                    </label>
                    <input
                      type="text"
                      value={formData.about_mission_title}
                      onChange={(e) => setFormData({ ...formData, about_mission_title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mission Content
                    </label>
                    <textarea
                      value={formData.about_mission_content}
                      onChange={(e) => setFormData({ ...formData, about_mission_content: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vision Title
                    </label>
                    <input
                      type="text"
                      value={formData.about_vision_title}
                      onChange={(e) => setFormData({ ...formData, about_vision_title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vision Content
                    </label>
                    <textarea
                      value={formData.about_vision_content}
                      onChange={(e) => setFormData({ ...formData, about_vision_content: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Gallery Page Content */}
      {activePage === "gallery" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-bold font-heading">Gallery Page</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={formData.gallery_title}
                    onChange={(e) => setFormData({ ...formData, gallery_title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.gallery_subtitle}
                    onChange={(e) => setFormData({ ...formData, gallery_subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  To manage gallery images, add them to the <code className="bg-gray-100 px-1 rounded">/public/images/gallery/</code> folder
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Contact Page Content */}
      {activePage === "contact" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-bold font-heading">Contact Page</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={formData.contact_title}
                    onChange={(e) => setFormData({ ...formData, contact_title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.contact_subtitle}
                    onChange={(e) => setFormData({ ...formData, contact_subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-bold font-heading">Contact Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.contact_address}
                    onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={formData.contact_hours}
                    onChange={(e) => setFormData({ ...formData, contact_hours: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

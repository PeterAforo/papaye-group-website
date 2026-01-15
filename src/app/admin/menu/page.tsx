"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  X,
  Upload,
  Link,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  isPopular: boolean;
  isAvailable: boolean;
  category: { name: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    categoryId: "",
    isPopular: false,
    isAvailable: true,
  });
  const [imageInputMode, setImageInputMode] = useState<"url" | "upload">("url");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        fetch("/api/admin/menu"),
        fetch("/api/admin/categories"),
      ]);
      const menuData = await menuRes.json();
      const catData = await catRes.json();
      setMenuItems(menuData);
      setCategories(catData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || "",
        price: item.price.toString(),
        image: item.image || "",
        categoryId: item.categoryId,
        isPopular: item.isPopular,
        isAvailable: item.isAvailable,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        image: "",
        categoryId: categories[0]?.id || "",
        isPopular: false,
        isAvailable: true,
      });
    }
    setImageInputMode("url");
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "menu");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setFormData({ ...formData, image: data.url });
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingItem
        ? `/api/admin/menu/${editingItem.id}`
        : "/api/admin/menu";
      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save menu item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/admin/menu/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      await fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete menu item");
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
          <h1 className="text-3xl font-bold font-heading">Menu Items</h1>
          <p className="text-gray-600">Manage your restaurant menu</p>
        </div>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus className="w-5 h-5" />
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={item.image || "/images/placeholder-food.svg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                      Unavailable
                    </span>
                  </div>
                )}
                {item.isPopular && (
                  <span className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-xs">
                    Popular
                  </span>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.category?.name}</p>
                  </div>
                  <span className="text-primary font-bold">
                    GH₵ {item.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {item.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openModal(item)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No menu items found</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (GH₵) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                
                {/* Image input mode toggle */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setImageInputMode("url")}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      imageInputMode === "url"
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Link className="w-4 h-4" />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode("upload")}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      imageInputMode === "upload"
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                </div>

                {imageInputMode === "url" ? (
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://..."
                  />
                ) : (
                  <div className="space-y-2">
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Uploading...
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload image</p>
                          <p className="text-xs text-gray-400">Max 5MB (JPEG, PNG, GIF, WebP)</p>
                        </div>
                      )}
                    </label>
                  </div>
                )}

                {/* Image preview */}
                {formData.image && (
                  <div className="mt-3 relative">
                    <Image
                      src={formData.image}
                      alt="Preview"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Popular Item</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Available</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

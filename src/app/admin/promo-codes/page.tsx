"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Ticket,
  Plus,
  Trash2,
  Edit,
  Loader2,
  CheckCircle,
  XCircle,
  Percent,
  DollarSign,
  Truck,
  Calendar,
  Users,
  Copy,
} from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { usages: number };
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderAmount: "",
    maxDiscount: "",
    usageLimit: "",
    perUserLimit: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const response = await fetch("/api/admin/promo-codes");
      const data = await response.json();
      setPromoCodes(data);
    } catch (error) {
      console.error("Failed to fetch promo codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = "/api/admin/promo-codes";
      const method = editingCode ? "PUT" : "POST";
      const body = editingCode ? { id: editingCode.id, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to save promo code");
        return;
      }

      fetchPromoCodes();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save promo code");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;

    try {
      await fetch(`/api/admin/promo-codes?id=${id}`, { method: "DELETE" });
      fetchPromoCodes();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (code: PromoCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      description: code.description || "",
      discountType: code.discountType,
      discountValue: code.discountValue.toString(),
      minOrderAmount: code.minOrderAmount?.toString() || "",
      maxDiscount: code.maxDiscount?.toString() || "",
      usageLimit: code.usageLimit?.toString() || "",
      perUserLimit: code.perUserLimit?.toString() || "",
      startDate: code.startDate ? code.startDate.split("T")[0] : "",
      endDate: code.endDate ? code.endDate.split("T")[0] : "",
      isActive: code.isActive,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCode(null);
    setFormData({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      minOrderAmount: "",
      maxDiscount: "",
      usageLimit: "",
      perUserLimit: "",
      startDate: "",
      endDate: "",
      isActive: true,
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case "PERCENTAGE": return <Percent className="w-4 h-4" />;
      case "FIXED": return <DollarSign className="w-4 h-4" />;
      case "FREE_DELIVERY": return <Truck className="w-4 h-4" />;
      default: return <Ticket className="w-4 h-4" />;
    }
  };

  const formatDiscount = (code: PromoCode) => {
    switch (code.discountType) {
      case "PERCENTAGE": return `${code.discountValue}% off`;
      case "FIXED": return `GH₵${code.discountValue} off`;
      case "FREE_DELIVERY": return "Free Delivery";
      default: return code.discountValue;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading flex items-center gap-3">
            <Ticket className="w-8 h-8 text-primary" />
            Promo Codes
          </h1>
          <p className="text-gray-600 mt-1">Create and manage discount codes</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Code
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <p className="text-green-100 text-sm">Active Codes</p>
            <p className="text-2xl font-bold">{promoCodes.filter(c => c.isActive).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <p className="text-blue-100 text-sm">Total Uses</p>
            <p className="text-2xl font-bold">{promoCodes.reduce((sum, c) => sum + c.usageCount, 0)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <p className="text-purple-100 text-sm">Percentage Codes</p>
            <p className="text-2xl font-bold">{promoCodes.filter(c => c.discountType === "PERCENTAGE").length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <p className="text-orange-100 text-sm">Fixed Amount</p>
            <p className="text-2xl font-bold">{promoCodes.filter(c => c.discountType === "FIXED").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Promo Codes List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">Code</th>
                  <th className="text-left p-4 font-medium text-gray-600">Discount</th>
                  <th className="text-left p-4 font-medium text-gray-600">Usage</th>
                  <th className="text-left p-4 font-medium text-gray-600">Valid Period</th>
                  <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  <th className="text-right p-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((code) => (
                  <motion.tr
                    key={code.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-3 py-1 rounded-lg font-mono font-bold text-primary">
                          {code.code}
                        </code>
                        <button
                          onClick={() => copyCode(code.code)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      {code.description && (
                        <p className="text-sm text-gray-500 mt-1">{code.description}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`p-2 rounded-lg ${
                          code.discountType === "PERCENTAGE" ? "bg-blue-100 text-blue-600" :
                          code.discountType === "FIXED" ? "bg-green-100 text-green-600" :
                          "bg-purple-100 text-purple-600"
                        }`}>
                          {getDiscountIcon(code.discountType)}
                        </span>
                        <span className="font-medium">{formatDiscount(code)}</span>
                      </div>
                      {code.minOrderAmount && (
                        <p className="text-xs text-gray-500 mt-1">Min: GH₵{code.minOrderAmount}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{code.usageCount}</span>
                        {code.usageLimit && <span className="text-gray-400">/ {code.usageLimit}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      {code.startDate || code.endDate ? (
                        <div className="text-sm">
                          {code.startDate && <p>From: {new Date(code.startDate).toLocaleDateString()}</p>}
                          {code.endDate && <p>To: {new Date(code.endDate).toLocaleDateString()}</p>}
                        </div>
                      ) : (
                        <span className="text-gray-400">No limit</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        code.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {code.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(code)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(code.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {promoCodes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No promo codes yet. Create your first one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingCode ? "Edit Promo Code" : "Create Promo Code"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SAVE20"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., 20% off for new customers"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (GH₵)</option>
                    <option value="FREE_DELIVERY">Free Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {formData.discountType === "PERCENTAGE" ? "Percentage *" : "Amount *"}
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === "PERCENTAGE" ? "e.g., 20" : "e.g., 10"}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    required={formData.discountType !== "FREE_DELIVERY"}
                    disabled={formData.discountType === "FREE_DELIVERY"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Order Amount</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    placeholder="e.g., 50"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Discount</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="e.g., 30"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Per User Limit</label>
                  <input
                    type="number"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Active</label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingCode ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

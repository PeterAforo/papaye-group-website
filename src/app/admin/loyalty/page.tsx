"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Users,
  Star,
  Gift,
  TrendingUp,
  Crown,
} from "lucide-react";

interface LoyaltyReward {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
  rewardType: string;
  rewardValue: number | null;
  menuItemId: string | null;
  isActive: boolean;
}

interface LoyaltyStats {
  totalMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  tierDistribution: {
    BRONZE: number;
    SILVER: number;
    GOLD: number;
    PLATINUM: number;
  };
}

export default function LoyaltyPage() {
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pointsCost: "",
    rewardType: "DISCOUNT_PERCENT",
    rewardValue: "",
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/admin/loyalty");
      const data = await response.json();
      setStats(data.stats);
      setRewards(data.rewards || []);
    } catch (error) {
      console.error("Failed to fetch loyalty data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const body = editingReward ? { id: editingReward.id, ...formData, pointsCost: parseInt(formData.pointsCost), rewardValue: formData.rewardValue ? parseFloat(formData.rewardValue) : null } : { ...formData, pointsCost: parseInt(formData.pointsCost), rewardValue: formData.rewardValue ? parseFloat(formData.rewardValue) : null };

      const response = await fetch("/api/admin/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to save reward");
        return;
      }

      fetchData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this reward?")) return;
    try {
      await fetch(`/api/admin/loyalty?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (reward: LoyaltyReward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description || "",
      pointsCost: reward.pointsCost.toString(),
      rewardType: reward.rewardType,
      rewardValue: reward.rewardValue?.toString() || "",
      isActive: reward.isActive,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingReward(null);
    setFormData({
      name: "",
      description: "",
      pointsCost: "",
      rewardType: "DISCOUNT_PERCENT",
      rewardValue: "",
      isActive: true,
    });
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "BRONZE": return "from-orange-400 to-orange-600";
      case "SILVER": return "from-gray-400 to-gray-600";
      case "GOLD": return "from-yellow-400 to-yellow-600";
      case "PLATINUM": return "from-purple-400 to-purple-600";
      default: return "from-gray-400 to-gray-600";
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
            <Award className="w-8 h-8 text-primary" />
            Loyalty Program
          </h1>
          <p className="text-gray-600 mt-1">Manage rewards and track member engagement</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Reward
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Members</p>
                <p className="text-2xl font-bold">{stats?.totalMembers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Points Issued</p>
                <p className="text-2xl font-bold">{stats?.totalPointsIssued?.toLocaleString() || 0}</p>
              </div>
              <Star className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Points Redeemed</p>
                <p className="text-2xl font-bold">{stats?.totalPointsRedeemed?.toLocaleString() || 0}</p>
              </div>
              <Gift className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Active Rewards</p>
                <p className="text-2xl font-bold">{rewards.filter(r => r.isActive).length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Distribution */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Member Tiers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["BRONZE", "SILVER", "GOLD", "PLATINUM"].map((tier) => (
              <div key={tier} className={`p-4 rounded-xl bg-gradient-to-br ${getTierColor(tier)} text-white text-center`}>
                <p className="text-2xl font-bold">{stats?.tierDistribution?.[tier as keyof typeof stats.tierDistribution] || 0}</p>
                <p className="text-sm opacity-80">{tier}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Tier Requirements:</strong> Bronze (0-499 pts), Silver (500-1499 pts), Gold (1500-4999 pts), Platinum (5000+ pts)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rewards List */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4">Available Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 border rounded-xl ${reward.isActive ? "bg-white" : "bg-gray-50 opacity-60"}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold">{reward.name}</h4>
                    <p className="text-sm text-gray-500">{reward.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(reward)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(reward.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">{reward.pointsCost} pts</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${reward.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {reward.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </motion.div>
            ))}
            {rewards.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No rewards yet. Create your first one!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full"
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{editingReward ? "Edit Reward" : "Add Reward"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Free Drink"
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Get a free soft drink"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Points Cost *</label>
                  <input
                    type="number"
                    value={formData.pointsCost}
                    onChange={(e) => setFormData({ ...formData, pointsCost: e.target.value })}
                    placeholder="e.g., 100"
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reward Type *</label>
                  <select
                    value={formData.rewardType}
                    onChange={(e) => setFormData({ ...formData, rewardType: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="DISCOUNT_PERCENT">% Discount</option>
                    <option value="DISCOUNT_FIXED">Fixed Discount</option>
                    <option value="FREE_DELIVERY">Free Delivery</option>
                    <option value="FREE_ITEM">Free Item</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reward Value</label>
                <input
                  type="number"
                  value={formData.rewardValue}
                  onChange={(e) => setFormData({ ...formData, rewardValue: e.target.value })}
                  placeholder="e.g., 10 (for 10% or GH₵10)"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive">Active</label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingReward ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
  MessageSquare,
  TrendingUp,
  Utensils,
  Truck,
  HeadphonesIcon,
} from "lucide-react";

interface OrderReview {
  id: string;
  orderId: string;
  rating: number;
  foodRating: number | null;
  serviceRating: number | null;
  deliveryRating: number | null;
  comment: string | null;
  isPublic: boolean;
  createdAt: string;
  order: {
    orderNumber: string;
    user: { name: string; email: string } | null;
    guestName: string | null;
    guestEmail: string | null;
  } | null;
}

interface ReviewStats {
  totalReviews: number;
  avgRating: number;
  avgFoodRating: number;
  avgServiceRating: number;
  avgDeliveryRating: number;
  ratingDistribution: Record<number, number>;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<OrderReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/admin/reviews");
      const data = await response.json();
      setReviews(data.reviews || []);
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id: string, isPublic: boolean) => {
    try {
      await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPublic: !isPublic }),
      });
      fetchReviews();
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      fetchReviews();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  const getCustomerName = (review: OrderReview) => {
    return review.order?.user?.name || review.order?.guestName || "Anonymous";
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
      <div>
        <h1 className="text-3xl font-bold font-heading flex items-center gap-3">
          <Star className="w-8 h-8 text-yellow-500" />
          Customer Reviews
        </h1>
        <p className="text-gray-600 mt-1">Monitor and manage customer feedback</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Overall Rating</p>
                <p className="text-2xl font-bold">{stats?.avgRating?.toFixed(1) || 0} / 5</p>
              </div>
              <Star className="w-8 h-8 text-yellow-200 fill-yellow-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Food Quality</p>
                <p className="text-2xl font-bold">{stats?.avgFoodRating?.toFixed(1) || 0}</p>
              </div>
              <Utensils className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Service</p>
                <p className="text-2xl font-bold">{stats?.avgServiceRating?.toFixed(1) || 0}</p>
              </div>
              <HeadphonesIcon className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Delivery</p>
                <p className="text-2xl font-bold">{stats?.avgDeliveryRating?.toFixed(1) || 0}</p>
              </div>
              <Truck className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Reviews</p>
                <p className="text-2xl font-bold">{stats?.totalReviews || 0}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats?.ratingDistribution?.[rating] || 0;
              const percentage = stats?.totalReviews ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    <span className="font-medium">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-sm text-gray-500 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4">All Reviews</h3>
          <div className="space-y-4">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 border rounded-xl ${!review.isPublic ? "bg-gray-50 opacity-70" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{getCustomerName(review)}</span>
                      <span className="text-sm text-gray-500">
                        Order #{review.order?.orderNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVisibility(review.id, review.isPublic)}
                      className={`p-2 rounded-lg ${review.isPublic ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                      title={review.isPublic ? "Hide review" : "Show review"}
                    >
                      {review.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub-ratings */}
                {(review.foodRating || review.serviceRating || review.deliveryRating) && (
                  <div className="flex gap-4 mt-3 text-sm">
                    {review.foodRating && (
                      <span className="flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-orange-500" />
                        Food: {review.foodRating}/5
                      </span>
                    )}
                    {review.serviceRating && (
                      <span className="flex items-center gap-1">
                        <HeadphonesIcon className="w-3 h-3 text-blue-500" />
                        Service: {review.serviceRating}/5
                      </span>
                    )}
                    {review.deliveryRating && (
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3 text-green-500" />
                        Delivery: {review.deliveryRating}/5
                      </span>
                    )}
                  </div>
                )}

                {review.comment && (
                  <p className="mt-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                )}
              </motion.div>
            ))}
            {reviews.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No reviews yet. Reviews will appear here when customers rate their orders.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

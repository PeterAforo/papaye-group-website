"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Loader2,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Truck,
  Eye,
  X,
} from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: {
    name: string;
    image: string | null;
  };
}

interface Address {
  street: string;
  city: string;
  region: string;
  landmark: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  deliveryType: string;
  paymentMethod: string;
  createdAt: string;
  address: Address | null;
  notes: string | null;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/account/orders");
    } else if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/account/orders?details=true");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PREPARING":
        return "bg-purple-100 text-purple-800";
      case "READY":
        return "bg-green-100 text-green-800";
      case "OUT_FOR_DELIVERY":
        return "bg-indigo-100 text-indigo-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return Clock;
      case "PREPARING":
        return ChefHat;
      case "OUT_FOR_DELIVERY":
        return Truck;
      case "DELIVERED":
        return CheckCircle;
      case "CANCELLED":
        return XCircle;
      default:
        return Clock;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/account")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold font-heading">My Orders</h1>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">No orders yet</h2>
                <p className="text-gray-500 mb-4">
                  You haven&apos;t placed any orders yet.
                </p>
                <Button onClick={() => router.push("/menu")}>
                  Browse Menu
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <StatusIcon className="w-5 h-5 text-gray-500" />
                              <span className="font-bold text-lg">
                                {order.orderNumber}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {order.status.replace(/_/g, " ")}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                <strong>Date:</strong>{" "}
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                              <p>
                                <strong>Type:</strong> {order.deliveryType}
                              </p>
                              <p>
                                <strong>Items:</strong> {order.items?.length || 0}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <p className="text-xl font-bold text-green-600">
                              GH₵ {order.total.toFixed(2)}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">{selectedOrder.orderNumber}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status.replace(/_/g, " ")}
                </span>
                <span className="text-gray-500">
                  {selectedOrder.deliveryType}
                </span>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-bold mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                          {item.quantity}x
                        </span>
                        <span>{item.menuItem.name}</span>
                      </div>
                      <span className="font-bold">
                        GH₵ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.address && (
                <div>
                  <h3 className="font-bold mb-2">Delivery Address</h3>
                  <p className="bg-gray-50 p-3 rounded-lg text-sm">
                    {selectedOrder.address.street}, {selectedOrder.address.city}, {selectedOrder.address.region}
                    {selectedOrder.address.landmark && ` (${selectedOrder.address.landmark})`}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-bold mb-2">Notes</h3>
                  <p className="bg-yellow-50 p-3 rounded-lg text-sm">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Order Summary */}
              <div>
                <h3 className="font-bold mb-3">Order Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>GH₵ {selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>GH₵ {selectedOrder.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-green-600">
                      GH₵ {selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="text-sm text-gray-600">
                <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
              </div>
            </div>

            <div className="p-6 border-t">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

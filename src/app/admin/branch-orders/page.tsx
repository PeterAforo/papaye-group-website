"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Search,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Truck,
  Eye,
  X,
  Plus,
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
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  deliveryAddress: string | null;
  notes: string | null;
  items: OrderItem[];
}

const statusOptions = [
  { value: "PENDING", label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  { value: "CONFIRMED", label: "Confirmed", icon: CheckCircle, color: "bg-blue-100 text-blue-800" },
  { value: "PREPARING", label: "Preparing", icon: ChefHat, color: "bg-purple-100 text-purple-800" },
  { value: "READY", label: "Ready", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck, color: "bg-indigo-100 text-indigo-800" },
  { value: "DELIVERED", label: "Delivered", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  { value: "CANCELLED", label: "Cancelled", icon: XCircle, color: "bg-red-100 text-red-800" },
];

export default function BranchOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/branch-orders");
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/branch-orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.guestPhone?.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status: string) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0];
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Branch Orders</h1>
          <p className="text-gray-600">Manage orders for your branch</p>
        </div>
        <Link href="/admin/orders/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order #, name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Status</option>
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
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
                          <span className="font-bold text-lg">{order.orderNumber}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Customer:</strong> {order.guestName || "Guest"}</p>
                          <p><strong>Phone:</strong> {order.guestPhone || "N/A"}</p>
                          <p><strong>Type:</strong> {order.deliveryType}</p>
                          <p><strong>Time:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <p className="text-xl font-bold text-green-600">
                          GH₵ {order.total.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items.length} item(s)
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              disabled={updating}
                              className="px-2 py-1 text-sm border rounded-lg"
                            >
                              {statusOptions.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
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
              {/* Customer Info */}
              <div>
                <h3 className="font-bold mb-2">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                  <p><strong>Name:</strong> {selectedOrder.guestName || "Guest"}</p>
                  <p><strong>Phone:</strong> {selectedOrder.guestPhone || "N/A"}</p>
                  <p><strong>Email:</strong> {selectedOrder.guestEmail || "N/A"}</p>
                  {selectedOrder.deliveryAddress && (
                    <p><strong>Address:</strong> {selectedOrder.deliveryAddress}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-bold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
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

              {/* Order Summary */}
              <div>
                <h3 className="font-bold mb-2">Order Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>GH₵ {selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>GH₵ {selectedOrder.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-green-600">GH₵ {selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-bold mb-2">Notes</h3>
                  <p className="bg-yellow-50 p-4 rounded-lg text-sm">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Status Update */}
              {selectedOrder.status !== "DELIVERED" && selectedOrder.status !== "CANCELLED" && (
                <div>
                  <h3 className="font-bold mb-2">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((status) => (
                      <Button
                        key={status.value}
                        variant={selectedOrder.status === status.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateOrderStatus(selectedOrder.id, status.value)}
                        disabled={updating}
                      >
                        <status.icon className="w-4 h-4 mr-1" />
                        {status.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

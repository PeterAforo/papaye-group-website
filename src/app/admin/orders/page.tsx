"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Loader2,
  Eye,
  X,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Plus,
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  deliveryType: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes: string;
  createdAt: string;
  user: { name: string; email: string; phone: string } | null;
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  address: { street: string; city: string; phone: string } | null;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

const orderStatuses = [
  { value: "PENDING", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "CONFIRMED", label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  { value: "PREPARING", label: "Preparing", color: "bg-purple-100 text-purple-800" },
  { value: "READY", label: "Ready", color: "bg-green-100 text-green-800" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery", color: "bg-indigo-100 text-indigo-800" },
  { value: "DELIVERED", label: "Delivered", color: "bg-green-100 text-green-800" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  // Set initial status filter from URL
  useEffect(() => {
    const urlStatus = searchParams.get('status');
    if (urlStatus) {
      setStatusFilter(urlStatus);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      const data = await response.json();
      // Ensure we always have an array
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update");

      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  // Helper to get customer name (from user or guest fields)
  const getCustomerName = (order: Order) => order.user?.name || order.guestName || 'Guest';
  const getCustomerContact = (order: Order) => order.user?.email || order.guestPhone || order.guestEmail || '';

  const filteredOrders = orders.filter((order) => {
    const customerName = getCustomerName(order);
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return orderStatuses.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-800";
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
          <h1 className="text-3xl font-bold font-heading">Orders</h1>
          <p className="text-gray-600">Manage customer orders</p>
        </div>
        <Link href="/admin/orders/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number or customer..."
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
              {orderStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">Order</th>
                <th className="text-left p-4 font-medium text-gray-600">Customer</th>
                <th className="text-left p-4 font-medium text-gray-600">Type</th>
                <th className="text-left p-4 font-medium text-gray-600">Total</th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                <th className="text-left p-4 font-medium text-gray-600">Date</th>
                <th className="text-left p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <span className="font-medium">{order.orderNumber}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{getCustomerName(order)}</p>
                      <p className="text-sm text-gray-500">{getCustomerContact(order)}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{order.deliveryType}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold">GH₵ {order.total.toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </Card>

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
                <h3 className="font-bold mb-2">Customer</h3>
                <p className="font-medium">{getCustomerName(selectedOrder)}</p>
                {selectedOrder.guestPhone && (
                  <p className="text-sm text-gray-500">Phone: {selectedOrder.guestPhone}</p>
                )}
                {selectedOrder.user?.email && (
                  <p className="text-sm text-gray-500">{selectedOrder.user.email}</p>
                )}
                {selectedOrder.guestEmail && (
                  <p className="text-sm text-gray-500">{selectedOrder.guestEmail}</p>
                )}
                {selectedOrder.address && (
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedOrder.address.street}, {selectedOrder.address.city}
                  </p>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-bold mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium">
                          GH₵ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">Items listed in notes below</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between mb-1">
                  <span>Subtotal</span>
                  <span>GH₵ {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Delivery Fee</span>
                  <span>GH₵ {selectedOrder.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">GH₵ {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="font-bold mb-2">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {orderStatuses.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => updateOrderStatus(selectedOrder.id, status.value)}
                      disabled={updating || selectedOrder.status === status.value}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        selectedOrder.status === status.value
                          ? status.color + " ring-2 ring-offset-2 ring-gray-400"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h3 className="font-bold mb-2">Notes</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

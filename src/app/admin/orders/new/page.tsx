"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Search,
  Loader2,
  ShoppingBag,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category: { name: string };
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

interface Branch {
  id: string;
  name: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [userBranchId, setUserBranchId] = useState<string | null>(null);

  // Customer info
  const [customerType, setCustomerType] = useState<"guest" | "existing">("guest");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // Order details
  const [deliveryType, setDeliveryType] = useState<"DELIVERY" | "PICKUP">("PICKUP");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [branchId, setBranchId] = useState("");
  const [notes, setNotes] = useState("");

  // Delivery address
  const [address, setAddress] = useState({
    street: "",
    city: "",
    region: "Greater Accra",
    landmark: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, branchRes, profileRes] = await Promise.all([
        fetch("/api/admin/menu"),
        fetch("/api/branches"),
        fetch("/api/account/profile"),
      ]);

      const menuData = await menuRes.json();
      const branchData = await branchRes.json();
      const profileData = profileRes.ok ? await profileRes.json() : null;

      // Admin menu API returns array directly
      const items = Array.isArray(menuData) ? menuData : [];
      setMenuItems(items);
      
      // Handle branches - could be array or object with branches property
      const branchList = Array.isArray(branchData) ? branchData : (branchData.branches || []);
      setBranches(branchList);

      // Extract unique categories
      const categoryNames = items.map((item: MenuItem) => item.category?.name).filter(Boolean);
      const uniqueCategories = Array.from(new Set(categoryNames)) as string[];
      setCategories(uniqueCategories);

      // Set branch based on user role
      if (profileData?.branchId) {
        // Branch manager/staff - use their assigned branch
        setUserBranchId(profileData.branchId);
        setBranchId(profileData.branchId);
      } else if (branchList.length > 0) {
        // Admin - default to first branch
        setBranchId(branchList[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (menuItem: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((item) => item.menuItem.id !== menuItemId));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );
  const deliveryFee = deliveryType === "DELIVERY" ? 10 : 0;
  const total = subtotal + deliveryFee;

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category.name === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async () => {
    if (cart.length === 0) {
      alert("Please add items to the order");
      return;
    }

    if (!customerInfo.name || !customerInfo.phone) {
      alert("Please provide customer name and phone number");
      return;
    }

    if (deliveryType === "DELIVERY" && !address.street) {
      alert("Please provide delivery address");
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        items: cart.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes,
        })),
        deliveryType,
        paymentMethod,
        branchId,
        notes,
        isGuest: true,
        guestInfo: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email,
        },
        address: deliveryType === "DELIVERY" ? {
          name: customerInfo.name,
          phone: customerInfo.phone,
          ...address,
        } : null,
        isBackendOrder: true, // Flag to indicate this is placed from backend
      };

      const response = await fetch("/api/admin/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }

      const result = await response.json();
      alert(`Order created successfully! Order #${result.orderNumber}`);
      router.push("/admin/orders");
    } catch (error: any) {
      console.error("Order creation error:", error);
      alert(error.message || "Failed to create order");
    } finally {
      setSubmitting(false);
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
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-heading">New Order</h1>
          <p className="text-gray-600">Create a new order from the backend</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-bold mb-4">Select Items</h2>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
                {filteredItems.map((item) => {
                  const inCart = cart.find((c) => c.menuItem.id === item.id);
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        inCart ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary"
                      }`}
                      onClick={() => addToCart(item)}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-20 object-cover rounded mb-2"
                        />
                      )}
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-primary font-bold text-sm">GH₵ {item.price.toFixed(2)}</p>
                      {inCart && (
                        <p className="text-xs text-primary mt-1">In cart: {inCart.quantity}</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Order Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("PICKUP")}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                        deliveryType === "PICKUP"
                          ? "bg-primary text-white border-primary"
                          : "border-gray-300 hover:border-primary"
                      }`}
                    >
                      Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType("DELIVERY")}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                        deliveryType === "DELIVERY"
                          ? "bg-primary text-white border-primary"
                          : "border-gray-300 hover:border-primary"
                      }`}
                    >
                      Delivery
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="CASH">Cash</option>
                    <option value="MOMO">Mobile Money</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  {isAdmin ? (
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                      {branches.find(b => b.id === branchId)?.name || "Your Branch"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Any special instructions"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              {deliveryType === "DELIVERY" && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Delivery Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter street address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Landmark
                      </label>
                      <input
                        type="text"
                        value={address.landmark}
                        onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Near landmark"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary / Cart */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-4">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Order Summary
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No items added yet</p>
                  <p className="text-sm">Click on menu items to add them</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
                    {cart.map((item) => (
                      <div
                        key={item.menuItem.id}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.menuItem.name}</p>
                          <p className="text-primary text-sm">
                            GH₵ {(item.menuItem.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, -1)}
                            className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, 1)}
                            className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.menuItem.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>GH₵ {subtotal.toFixed(2)}</span>
                    </div>
                    {deliveryType === "DELIVERY" && (
                      <div className="flex justify-between text-sm">
                        <span>Delivery Fee</span>
                        <span>GH₵ {deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">GH₵ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    className="w-full mt-4"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={submitting || cart.length === 0}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

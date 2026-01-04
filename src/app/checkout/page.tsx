"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Phone,
  CreditCard,
  Truck,
  Store,
  ChevronLeft,
  Loader2,
  CheckCircle,
  User,
  LogIn,
} from "lucide-react";

type DeliveryType = "DELIVERY" | "PICKUP";
type PaymentMethod = "CASH" | "MOMO" | "CARD";
type CheckoutMode = "guest" | "account";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode | null>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("DELIVERY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isLoading, setIsLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [onlineOrdersEnabled, setOnlineOrdersEnabled] = useState(true);
  const [checkingOrders, setCheckingOrders] = useState(true);
  const [branches, setBranches] = useState<{id: string; name: string; address: string}[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "Accra",
    region: "Greater Accra",
    landmark: "",
    notes: "",
  });

  // Handle hydration and check online orders status
  useEffect(() => {
    setMounted(true);
    
    // Check if online orders are enabled
    const checkOnlineOrders = async () => {
      try {
        const response = await fetch("/api/settings/online-orders");
        const data = await response.json();
        setOnlineOrdersEnabled(data.enabled);
      } catch (error) {
        console.error("Failed to check online orders status:", error);
        // Default to enabled if check fails
        setOnlineOrdersEnabled(true);
      } finally {
        setCheckingOrders(false);
      }
    };
    
    // Fetch branches for pickup selection
    const fetchBranches = async () => {
      try {
        const response = await fetch("/api/branches");
        const data = await response.json();
        setBranches(data.filter((b: any) => b.isActive));
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      }
    };
    
    checkOnlineOrders();
    fetchBranches();
  }, []);

  // Auto-select mode if logged in
  useEffect(() => {
    if (session?.user) {
      setCheckoutMode("account");
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [session]);

  // Redirect if cart is empty (only after mounted)
  useEffect(() => {
    if (mounted && items.length === 0 && !orderComplete) {
      router.push("/menu");
    }
  }, [mounted, items, router, orderComplete]);

  const subtotal = getSubtotal();
  const deliveryFee = deliveryType === "DELIVERY" ? (subtotal >= 100 ? 0 : 10) : 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            notes: item.notes,
          })),
          deliveryType,
          paymentMethod,
          branchId: deliveryType === "PICKUP" ? selectedBranchId : null,
          address: deliveryType === "DELIVERY" ? formData : null,
          notes: formData.notes,
          // Guest checkout info
          isGuest: checkoutMode === "guest",
          guestInfo: checkoutMode === "guest" ? {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          } : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      setOrderNumber(data.orderNumber);
      setOrderComplete(true);
      clearCart();
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error instanceof Error ? error.message : "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading only during initial mount
  if (!mounted || checkingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show message if online orders are disabled
  if (!onlineOrdersEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="w-10 h-10 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold font-heading mb-4">Online Orders Temporarily Unavailable</h1>
            <p className="text-gray-600 mb-8">
              We&apos;re not accepting online orders at the moment. Please visit us in-store or check back later.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/menu">
                <Button variant="outline" className="gap-2">
                  <ChevronLeft className="w-5 h-5" />
                  Browse Menu
                </Button>
              </Link>
              <Link href="/branches">
                <Button className="gap-2">
                  <MapPin className="w-5 h-5" />
                  Find a Branch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show checkout mode selection if not logged in and mode not selected
  if (!session && !checkoutMode) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link
            href="/menu"
            className="inline-flex items-center text-gray-600 hover:text-primary mb-6"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Menu
          </Link>

          <h1 className="text-3xl font-bold font-heading mb-8 text-center">Checkout</h1>

          <div className="grid gap-4">
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setCheckoutMode("guest")}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Continue as Guest</h3>
                  <p className="text-gray-500 text-sm">
                    Quick checkout without creating an account
                  </p>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => router.push("/auth/login?callbackUrl=/checkout")}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <LogIn className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Sign In</h3>
                  <p className="text-gray-500 text-sm">
                    Track orders, earn rewards, and faster checkout
                  </p>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
              </CardContent>
            </Card>

            <div className="text-center mt-4">
              <p className="text-gray-500 text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register?callbackUrl=/checkout" className="text-primary hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold font-heading mb-4">Order Placed!</h1>
          <p className="text-gray-600 mb-2">
            Your order has been successfully placed.
          </p>
          <p className="text-lg font-medium text-primary mb-6">
            Order Number: {orderNumber}
          </p>
          <p className="text-gray-500 mb-8">
            We&apos;ll send you updates about your order via SMS.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/account/orders">Track Order</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/menu">Continue Shopping</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/menu"
          className="inline-flex items-center text-gray-600 hover:text-primary mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Menu
        </Link>

        <h1 className="text-3xl font-bold font-heading mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Guest Contact Info */}
              {checkoutMode === "guest" && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Contact Information
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="+233 XX XXX XXXX"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      Want to track your orders?{" "}
                      <Link href="/auth/register?callbackUrl=/checkout" className="text-primary hover:underline">
                        Create an account
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Delivery Type */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold font-heading mb-4">
                    Delivery Method
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("DELIVERY")}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        deliveryType === "DELIVERY"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Truck
                        className={`w-8 h-8 ${
                          deliveryType === "DELIVERY"
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      />
                      <span className="font-medium">Delivery</span>
                      <span className="text-sm text-gray-500">
                        {subtotal >= 100 ? "Free" : "GH₵ 10.00"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType("PICKUP")}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        deliveryType === "PICKUP"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Store
                        className={`w-8 h-8 ${
                          deliveryType === "PICKUP"
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      />
                      <span className="font-medium">Pickup</span>
                      <span className="text-sm text-gray-500">Free</span>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Pickup Branch Selection */}
              {deliveryType === "PICKUP" && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
                      <Store className="w-5 h-5 text-primary" />
                      Select Pickup Branch
                    </h2>
                    <div className="space-y-3">
                      {branches.length === 0 ? (
                        <p className="text-gray-500">Loading branches...</p>
                      ) : (
                        branches.map((branch) => (
                          <label
                            key={branch.id}
                            className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedBranchId === branch.id
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="branch"
                              value={branch.id}
                              checked={selectedBranchId === branch.id}
                              onChange={(e) => setSelectedBranchId(e.target.value)}
                              className="mt-1"
                              required
                            />
                            <div>
                              <p className="font-medium">{branch.name}</p>
                              <p className="text-sm text-gray-500">{branch.address}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Delivery Address */}
              {deliveryType === "DELIVERY" && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Delivery Address
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="+233 XX XXX XXXX"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.street}
                          onChange={(e) =>
                            setFormData({ ...formData, street: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="House number, street name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Landmark
                        </label>
                        <input
                          type="text"
                          value={formData.landmark}
                          onChange={(e) =>
                            setFormData({ ...formData, landmark: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Near..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Method */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    {[
                      { id: "CASH", label: "Cash on Delivery", icon: "💵" },
                      { id: "MOMO", label: "Mobile Money", icon: "📱" },
                      { id: "CARD", label: "Card Payment", icon: "💳" },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) =>
                            setPaymentMethod(e.target.value as PaymentMethod)
                          }
                          className="sr-only"
                        />
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-medium">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold font-heading mb-4">
                    Order Notes (Optional)
                  </h2>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Any special instructions for your order..."
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold font-heading mb-4">
                    Order Summary
                  </h2>

                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {item.name}
                          </h4>
                          <p className="text-gray-500 text-sm">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          GH₵ {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>GH₵ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span>
                        {deliveryFee === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          `GH₵ ${deliveryFee.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">
                        GH₵ {total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      `Place Order • GH₵ ${total.toFixed(2)}`
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    By placing this order, you agree to our Terms of Service
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

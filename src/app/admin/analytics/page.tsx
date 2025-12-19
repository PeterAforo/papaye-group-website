"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Loader2,
  Download,
  Calendar,
  PieChart as PieChartIcon,
  Award,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

type AnalyticsTab = "customers" | "menu" | "sales";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6"];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("sales");
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [activeTab, period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?type=${activeTab}&period=${period}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data) return;
    
    let csvContent = "";
    let filename = "";

    if (activeTab === "customers" && data.customers) {
      csvContent = "Name,Email,Phone,Orders,Total Spent,Avg Order,Last Order\n";
      data.customers.forEach((c: any) => {
        csvContent += `"${c.name || ''}","${c.email}","${c.phone || ''}",${c.orderCount},${c.totalSpent.toFixed(2)},${c.avgOrderValue.toFixed(2)},"${c.lastOrder || ''}"\n`;
      });
      filename = "customer-analytics.csv";
    } else if (activeTab === "menu" && data.topItems) {
      csvContent = "Item,Category,Price,Quantity Sold,Revenue\n";
      data.topItems.forEach((i: any) => {
        csvContent += `"${i.name}","${i.category}",${i.price},${i.totalOrdered},${i.totalRevenue.toFixed(2)}\n`;
      });
      filename = "menu-performance.csv";
    } else if (activeTab === "sales" && data.dailyBreakdown) {
      csvContent = "Date,Orders,Revenue,Items Sold\n";
      data.dailyBreakdown.forEach((d: any) => {
        csvContent += `${d.date},${d.orders},${d.revenue.toFixed(2)},${d.items}\n`;
      });
      filename = "sales-report.csv";
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  const tabs = [
    { id: "sales" as AnalyticsTab, label: "Sales Reports", icon: DollarSign },
    { id: "customers" as AnalyticsTab, label: "Customer Analytics", icon: Users },
    { id: "menu" as AnalyticsTab, label: "Menu Performance", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Analytics & Reports
          </h1>
          <p className="text-gray-600 mt-1">Insights into your business performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <Button onClick={exportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Sales Tab */}
          {activeTab === "sales" && data && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-4">
                    <p className="text-green-100 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold">GH₵ {data.summary?.totalRevenue?.toFixed(2) || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <p className="text-blue-100 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold">{data.summary?.totalOrders || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4">
                    <p className="text-purple-100 text-sm">Avg Order Value</p>
                    <p className="text-2xl font-bold">GH₵ {data.summary?.avgOrderValue?.toFixed(2) || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-4">
                    <p className="text-orange-100 text-sm">Items Sold</p>
                    <p className="text-2xl font-bold">{data.summary?.totalItems || 0}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Chart */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Daily Revenue</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.dailyBreakdown || []}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₵${v}`} />
                        <Tooltip formatter={(value: number) => [`GH₵ ${value.toFixed(2)}`, "Revenue"]} />
                        <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Payment & Delivery Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">Payment Methods</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.paymentBreakdown || []}
                            dataKey="amount"
                            nameKey="method"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ method, percent }) => `${method} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {(data.paymentBreakdown || []).map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `GH₵ ${value.toFixed(2)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">Order Type</h3>
                    <div className="space-y-4 mt-8">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <span className="font-medium">🚗 Delivery</span>
                        <span className="text-2xl font-bold text-blue-600">{data.deliveryBreakdown?.DELIVERY || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <span className="font-medium">🏪 Pickup</span>
                        <span className="text-2xl font-bold text-green-600">{data.deliveryBreakdown?.PICKUP || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === "customers" && data && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <p className="text-blue-100 text-sm">Total Customers</p>
                    <p className="text-2xl font-bold">{data.summary?.totalCustomers || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-4">
                    <p className="text-green-100 text-sm">Active Customers</p>
                    <p className="text-2xl font-bold">{data.summary?.activeCustomers || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4">
                    <p className="text-purple-100 text-sm">Avg Lifetime Value</p>
                    <p className="text-2xl font-bold">GH₵ {data.summary?.avgLifetimeValue?.toFixed(2) || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-4">
                    <p className="text-orange-100 text-sm">Avg Orders/Customer</p>
                    <p className="text-2xl font-bold">{data.summary?.avgOrdersPerCustomer?.toFixed(1) || 0}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Customers Table */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Top Customers by Spending
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3 font-medium text-gray-600">Rank</th>
                          <th className="text-left p-3 font-medium text-gray-600">Customer</th>
                          <th className="text-right p-3 font-medium text-gray-600">Orders</th>
                          <th className="text-right p-3 font-medium text-gray-600">Total Spent</th>
                          <th className="text-right p-3 font-medium text-gray-600">Avg Order</th>
                          <th className="text-right p-3 font-medium text-gray-600">Last Order</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data.customers || []).slice(0, 20).map((customer: any, index: number) => (
                          <tr key={customer.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? "bg-yellow-100 text-yellow-700" :
                                index === 1 ? "bg-gray-100 text-gray-700" :
                                index === 2 ? "bg-orange-100 text-orange-700" :
                                "bg-gray-50 text-gray-500"
                              }`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="p-3">
                              <p className="font-medium">{customer.name || "Guest"}</p>
                              <p className="text-sm text-gray-500">{customer.email}</p>
                            </td>
                            <td className="p-3 text-right">{customer.orderCount}</td>
                            <td className="p-3 text-right font-bold text-green-600">
                              GH₵ {customer.totalSpent.toFixed(2)}
                            </td>
                            <td className="p-3 text-right">GH₵ {customer.avgOrderValue.toFixed(2)}</td>
                            <td className="p-3 text-right text-sm text-gray-500">
                              {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Menu Tab */}
          {activeTab === "menu" && data && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-4">
                    <p className="text-green-100 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold">GH₵ {data.summary?.totalRevenue?.toFixed(2) || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <p className="text-blue-100 text-sm">Items Sold</p>
                    <p className="text-2xl font-bold">{data.summary?.totalItemsSold || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4">
                    <p className="text-purple-100 text-sm">Unique Items</p>
                    <p className="text-2xl font-bold">{data.summary?.uniqueItems || 0}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Category Breakdown */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Revenue by Category</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.categoryBreakdown || []} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(v) => `₵${v}`} />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip formatter={(value: number) => `GH₵ ${value.toFixed(2)}`} />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top & Slow Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 text-green-600">🔥 Best Sellers</h3>
                    <div className="space-y-3">
                      {(data.topItems || []).slice(0, 10).map((item: any, index: number) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">GH₵ {item.totalRevenue.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{item.totalOrdered} sold</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 text-orange-600">📉 Slow Movers</h3>
                    <div className="space-y-3">
                      {(data.slowItems || []).slice(0, 10).map((item: any, index: number) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-600">GH₵ {item.totalRevenue.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{item.totalOrdered} sold</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

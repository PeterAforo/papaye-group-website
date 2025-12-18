"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingBag,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChefHat,
  ArrowRight,
  Building2,
  BarChart3,
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
  Legend,
  AreaChart,
  Area,
} from "recharts";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
  cancelledOrders: number;
  deliveredOrders: number;
  preparingOrders: number;
}

interface BranchStat {
  branchId: string;
  branchName: string;
  orderCount: number;
  revenue: number;
}

interface DailyTrend {
  date: string;
  day: string;
  orders: number;
  revenue: number;
}

interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  user: { name: string; email: string } | null;
  guestName: string | null;
  guestPhone: string | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [branchStats, setBranchStats] = useState<BranchStat[]>([]);
  const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>([]);
  const [branchDailyData, setBranchDailyData] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [branchNames, setBranchNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getCustomerName = (order: RecentOrder) => order.user?.name || order.guestName || 'Guest';

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      const data = await response.json();
      setStats(data.stats);
      setRecentOrders(data.recentOrders);
      setBranchStats(data.branchStats || []);
      setDailyTrend(data.dailyTrend || []);
      setBranchDailyData(data.branchDailyData || []);
      setStatusDistribution(data.statusDistribution || []);
      setBranchNames(data.branchNames || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const BRANCH_COLORS = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", 
    "#3b82f6", "#8b5cf6", "#ec4899", "#6366f1", "#84cc16"
  ];

  const statCards = [
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: "bg-blue-500",
      link: "/admin/orders",
      description: "Active orders (excl. cancelled)",
    },
    {
      title: "Total Revenue",
      value: `GH₵ ${(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-500",
      link: "/admin/orders?status=DELIVERED",
      description: "From completed orders",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-purple-500",
      link: "/admin/users",
      description: "Registered customers",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: "bg-yellow-500",
      link: "/admin/orders?status=PENDING",
      description: "Awaiting confirmation",
    },
  ];

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
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-heading">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() => router.push(stat.link)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View details</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row - Revenue Trend & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-heading">7-Day Revenue Trend</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp className="w-4 h-4" />
                <span>Last 7 days</span>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `₵${v}`} />
                  <Tooltip 
                    formatter={(value: number) => [`GH₵ ${value.toFixed(2)}`, "Revenue"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold font-heading mb-4">Order Status</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution.filter(s => s.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, "Orders"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Revenue Chart */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-heading">Branch Revenue</h2>
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `₵${v}`} />
                  <YAxis dataKey="branchName" type="category" tick={{ fontSize: 11 }} stroke="#9ca3af" width={100} />
                  <Tooltip 
                    formatter={(value: number) => [`GH₵ ${value.toFixed(2)}`, "Revenue"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Branch Orders Chart */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-heading">Branch Orders</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="branchName" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip 
                    formatter={(value: number) => [value, "Orders"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="orderCount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Daily Revenue Trend */}
      {branchNames.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-heading">Branch Daily Revenue (7 Days)</h2>
              <div className="flex flex-wrap gap-2">
                {branchNames.slice(0, 5).map((name, i) => (
                  <span key={name} className="flex items-center gap-1 text-xs">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: BRANCH_COLORS[i % BRANCH_COLORS.length] }}
                    />
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchDailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `₵${v}`} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [`GH₵ ${value.toFixed(2)}`, name]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  {branchNames.map((name, i) => (
                    <Bar 
                      key={name} 
                      dataKey={name} 
                      stackId="a" 
                      fill={BRANCH_COLORS[i % BRANCH_COLORS.length]} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branch Performance Table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-heading">Branch Performance Summary</h2>
            <button 
              onClick={() => router.push('/admin/branches')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Manage Branches <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">Rank</th>
                  <th className="text-left p-3 font-medium text-gray-600">Branch</th>
                  <th className="text-right p-3 font-medium text-gray-600">Orders</th>
                  <th className="text-right p-3 font-medium text-gray-600">Revenue</th>
                  <th className="text-right p-3 font-medium text-gray-600">Avg. Order</th>
                </tr>
              </thead>
              <tbody>
                {branchStats.map((branch, index) => (
                  <tr key={branch.branchId} className="border-b hover:bg-gray-50">
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
                    <td className="p-3 font-medium">{branch.branchName}</td>
                    <td className="p-3 text-right">{branch.orderCount}</td>
                    <td className="p-3 text-right font-bold text-green-600">
                      GH₵ {branch.revenue.toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-gray-600">
                      GH₵ {branch.orderCount > 0 ? (branch.revenue / branch.orderCount).toFixed(2) : "0.00"}
                    </td>
                  </tr>
                ))}
                {branchStats.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No branch data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold font-heading mb-4">Today&apos;s Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">Orders Today</span>
                </div>
                <span className="text-2xl font-bold">{stats?.todayOrders || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">Revenue Today</span>
                </div>
                <span className="text-2xl font-bold">
                  GH₵ {(stats?.todayRevenue || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Order Status Mini Cards */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div 
                className="p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                onClick={() => router.push('/admin/orders?status=PENDING')}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <p className="text-xl font-bold mt-1">{stats?.pendingOrders || 0}</p>
              </div>
              <div 
                className="p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                onClick={() => router.push('/admin/orders?status=PREPARING')}
              >
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Preparing</span>
                </div>
                <p className="text-xl font-bold mt-1">{stats?.preparingOrders || 0}</p>
              </div>
              <div 
                className="p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => router.push('/admin/orders?status=DELIVERED')}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">Delivered</span>
                </div>
                <p className="text-xl font-bold mt-1">{stats?.deliveredOrders || 0}</p>
              </div>
              <div 
                className="p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => router.push('/admin/orders?status=CANCELLED')}
              >
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-600">Cancelled</span>
                </div>
                <p className="text-xl font-bold mt-1">{stats?.cancelledOrders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-heading">Recent Orders</h2>
              <button 
                onClick={() => router.push('/admin/orders')}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              ) : (
                recentOrders.slice(0, 6).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => router.push('/admin/orders')}
                  >
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{getCustomerName(order)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">GH₵ {order.total.toFixed(2)}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Plus, AlertTriangle, TrendingUp, Package } from "lucide-react"

// Mock data for sales chart
const chartData = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 5200 },
  { month: "Apr", sales: 4800 },
  { month: "May", sales: 6100 },
  { month: "Jun", sales: 7200 },
]

// Mock data for recent orders
const recentOrders = [
  { id: "ORD-001", customer: "Sarah Johnson", amount: "$245.00", status: "Delivered", date: "2024-01-15" },
  { id: "ORD-002", customer: "Michael Chen", amount: "$89.50", status: "Processing", date: "2024-01-14" },
  { id: "ORD-003", customer: "Emma Davis", amount: "$156.75", status: "Shipped", date: "2024-01-14" },
  { id: "ORD-004", customer: "James Wilson", amount: "$423.00", status: "Processing", date: "2024-01-13" },
  { id: "ORD-005", customer: "Lisa Anderson", amount: "$78.25", status: "Delivered", date: "2024-01-12" },
]

// Mock data for low stock alerts
const lowStockProducts = [
  { id: "PROD-001", name: "Bamboo Toothbrush Set", stock: 3, threshold: 10 },
  { id: "PROD-002", name: "Organic Cotton Tote Bag", stock: 5, threshold: 15 },
  { id: "PROD-003", name: "Natural Soap Bars", stock: 2, threshold: 8 },
]

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Navigation - Forest Green */}
      <aside className={`bg-[#6B7A6A] text-white transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"}`}>
        <div className="flex items-center justify-center h-16 border-b border-[#5a6859] px-4">
          <h1 className={`font-serif font-bold text-lg transition-all ${!sidebarOpen && "hidden"}`}>EcoAdmin</h1>
          {!sidebarOpen && <Package size={24} className="text-[#F5F0E6]" />}
        </div>

        <nav className="pt-8 space-y-2 px-2">
          {[
            { label: "Dashboard", icon: "📊" },
            { label: "Products", icon: "📦" },
            { label: "Orders", icon: "🛒" },
            { label: "Customers", icon: "👥" },
            { label: "Analytics", icon: "📈" },
            { label: "Settings", icon: "⚙️" },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-md text-sm font-medium transition-colors hover:bg-[#5a6859]"
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-[#E8E2D4] px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#6B7A6A]">Dashboard</h1>
              <p className="text-sm text-[#A8B5A2] mt-1">Welcome back! Here's your product overview.</p>
            </div>
            <Button className="bg-[#D9C2B0] hover:bg-[#c9b29a] text-[#6B7A6A] font-medium">
              <Plus size={18} className="mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {/* Overview Cards - Irregular Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Sales Card */}
            <Card className="md:col-span-1 border-[#E8E2D4] bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-[#A8B5A2]">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#6B7A6A]">$28,345</div>
                <p className="text-xs text-[#A8B5A2] mt-2 flex items-center gap-1">
                  <TrendingUp size={14} /> +12% from last month
                </p>
              </CardContent>
            </Card>

            {/* Total Orders Card */}
            <Card className="md:col-span-1 border-[#E8E2D4] bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-[#A8B5A2]">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#6B7A6A]">482</div>
                <p className="text-xs text-[#A8B5A2] mt-2">This month</p>
              </CardContent>
            </Card>

            {/* Active Products Card */}
            <Card className="md:col-span-1 border-[#E8E2D4] bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-[#A8B5A2]">Active Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#6B7A6A]">156</div>
                <p className="text-xs text-[#A8B5A2] mt-2">In stock</p>
              </CardContent>
            </Card>
          </div>

          {/* Sales Chart and Low Stock Alerts - Asymmetric Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Sales Chart - Takes 2 columns on desktop */}
            <Card className="lg:col-span-2 border-[#E8E2D4] bg-white">
              <CardHeader>
                <CardTitle className="text-[#6B7A6A]">Sales Overview</CardTitle>
                <CardDescription className="text-[#A8B5A2]">Last 6 months performance</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D4" />
                    <XAxis dataKey="month" stroke="#A8B5A2" />
                    <YAxis stroke="#A8B5A2" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#F5F0E6", border: "1px solid #E8E2D4" }}
                      cursor={{ stroke: "#A8B5A2" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#6B7A6A"
                      strokeWidth={2}
                      dot={{ fill: "#D9C2B0", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Low Stock Alerts */}
            <Card className="lg:col-span-1 border-[#E8E2D4] bg-white">
              <CardHeader>
                <CardTitle className="text-[#6B7A6A] flex items-center gap-2 text-base">
                  <AlertTriangle size={18} className="text-[#D9C2B0]" />
                  Low Stock
                </CardTitle>
                <CardDescription className="text-[#A8B5A2]">Items below threshold</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="pb-3 border-b border-[#E8E2D4] last:border-b-0">
                      <p className="text-sm font-medium text-[#6B7A6A]">{product.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-[#D9C2B0] font-semibold">{product.stock} left</span>
                        <span className="text-xs text-[#A8B5A2]">threshold: {product.threshold}</span>
                      </div>
                      {/* Simple progress bar */}
                      <div className="mt-2 w-full h-1 bg-[#E8E2D4] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#D9C2B0]"
                          style={{ width: `${(product.stock / product.threshold) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders Table */}
          <Card className="border-[#E8E2D4] bg-white">
            <CardHeader>
              <CardTitle className="text-[#6B7A6A]">Recent Orders</CardTitle>
              <CardDescription className="text-[#A8B5A2]">Latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#E8E2D4] hover:bg-[#F5F0E6]">
                    <TableHead className="text-[#A8B5A2]">Order ID</TableHead>
                    <TableHead className="text-[#A8B5A2]">Customer</TableHead>
                    <TableHead className="text-[#A8B5A2]">Amount</TableHead>
                    <TableHead className="text-[#A8B5A2]">Status</TableHead>
                    <TableHead className="text-[#A8B5A2]">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order, idx) => (
                    <TableRow
                      key={order.id}
                      className={`border-b border-[#E8E2D4] ${idx % 2 === 0 ? "bg-[#F5F0E6]" : "bg-white"} hover:bg-[#E8E2D4] transition-colors`}
                    >
                      <TableCell className="font-mono text-sm text-[#6B7A6A]">{order.id}</TableCell>
                      <TableCell className="text-[#6B7A6A]">{order.customer}</TableCell>
                      <TableCell className="font-semibold text-[#6B7A6A]">{order.amount}</TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-1 rounded-md font-medium ${
                            order.status === "Delivered"
                              ? "bg-[#E8E2D4] text-[#6B7A6A]"
                              : order.status === "Shipped"
                                ? "bg-[#D9C2B0] text-[#6B7A6A]"
                                : "bg-[#A8B5A2] text-white"
                          }`}
                        >
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-[#A8B5A2] text-sm">{order.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

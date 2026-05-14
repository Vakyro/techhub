"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Sparkles,
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SmartInput } from "@/components/ui/smart-input"

type TabType = "overview" | "products" | "orders" | "users"

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  sales: number
  image: string
}

interface Order {
  id: string
  number: string
  customer: string
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
  date: string
}

interface User {
  id: number
  name: string
  email: string
  type: "buyer" | "seller"
  joinDate: string
  orders: number
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [searchQuery, setSearchQuery] = useState("")

  const stats = [
    {
      label: "Ingresos totales",
      value: "$125,400",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      label: “Órdenes”,
      value: "1,234",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Usuarios",
      value: "3,456",
      change: "+5.3%",
      trend: "up",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Productos",
      value: "892",
      change: "-2.1%",
      trend: "down",
      icon: Package,
      color: "bg-orange-100 text-orange-600",
    },
  ]

  const products: Product[] = [
    {
      id: 1,
      name: "Laptop Gaming ASUS ROG",
      category: "Laptops",
      price: 2299.99,
      stock: 12,
      sales: 34,
      image: "https://images.unsplash.com/photo-1588872657840-790ff3bde08f?w=80&h=80&fit=crop",
    },
    {
      id: 2,
      name: "Monitor 4K Samsung",
      category: "Monitores",
      price: 599.99,
      stock: 28,
      sales: 67,
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=80&h=80&fit=crop",
    },
    {
      id: 3,
      name: "Teclado Mecánico RGB",
      category: "Periféricos",
      price: 149.99,
      stock: 5,
      sales: 128,
      image: "https://images.unsplash.com/photo-1587829191301-26ec84aaaf1c?w=80&h=80&fit=crop",
    },
  ]

  const orders: Order[] = [
    {
      id: "1",
      number: "ORD-2024-001",
      customer: "Carlos Mendoza",
      total: 2499.99,
      status: "shipped",
      date: "2024-12-01",
    },
    {
      id: "2",
      number: "ORD-2024-002",
      customer: "María García",
      total: 899.99,
      status: "processing",
      date: "2024-12-02",
    },
    {
      id: "3",
      number: "ORD-2024-003",
      customer: "Juan López",
      total: 1299.99,
      status: "delivered",
      date: "2024-11-30",
    },
  ]

  const users: User[] = [
    {
      id: 1,
      name: "Carlos Mendoza",
      email: "carlos@example.com",
      type: "buyer",
      joinDate: "2024-06-15",
      orders: 12,
    },
    {
      id: 2,
      name: "TechHub Store",
      email: "store@techhub.com",
      type: "seller",
      joinDate: "2024-05-20",
      orders: 234,
    },
    {
      id: 3,
      name: "María García",
      email: "maria@example.com",
      type: "buyer",
      joinDate: "2024-08-10",
      orders: 5,
    },
  ]

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      processing: "Procesando",
      shipped: "Enviado",
      delivered: "Entregado",
    }
    return labels[status] || status
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="navbar-solid shadow-soft">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">techHub</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="rounded-lg cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Panel Administrativo</h1>
          <p className="text-muted-foreground">Gestiona tu tienda, productos, órdenes y usuarios</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            const isTrendUp = stat.trend === "up"
            const TrendIcon = isTrendUp ? TrendingUp : TrendingDown
            return (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className={`mt-2 flex items-center gap-1 text-sm ${isTrendUp ? "text-green-600" : "text-red-600"}`}>
                      <TrendIcon className="h-4 w-4" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-8">
            {(["overview", "products", "orders", "users"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-medium transition-colors cursor-pointer capitalize ${
                  activeTab === tab
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "overview" && "Resumen"}
                {tab === "products" && "Productos"}
                {tab === “orders” && “Órdenes”}
                {tab === "users" && "Usuarios"}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Orders */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <h2 className=”text-lg font-semibold text-foreground”>Órdenes recientes</h2>
                <Link href="#" className="text-sm text-primary hover:underline">Ver todas</Link>
              </div>
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
                    <div>
                      <p className="font-semibold text-foreground">{order.number}</p>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">${order.total.toFixed(2)}</p>
                        <span className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <div className="mb-2 flex items-center justify-between">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Esta semana</p>
                </div>
                <p className="text-2xl font-bold text-foreground">$42,500</p>
                <p className="mt-1 text-sm text-muted-foreground">+18% desde la semana pasada</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <div className="mb-2 flex items-center justify-between">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  <p className=”text-xs text-muted-foreground”>Órdenes pendientes</p>
                </div>
                <p className="text-2xl font-bold text-foreground">24</p>
                <p className="mt-1 text-sm text-muted-foreground">Requieren atención</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <div className="mb-2 flex items-center justify-between">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Stock bajo</p>
                </div>
                <p className="text-2xl font-bold text-orange-600">8</p>
                <p className="mt-1 text-sm text-muted-foreground">Productos para reabastecer</p>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="rounded-xl border border-border bg-card shadow-soft">
            <div className="border-b border-border p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SmartInput
                  type="search"
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  placeholder="Buscar productos..."
                  leftIcon={<Search className="h-4 w-4" />}
                  wrapperClassName="flex-1 min-w-0"
                  inputClassName="h-10 rounded-lg border-border bg-background py-2.5 text-sm shadow-none"
                />
                <Button className="rounded-lg bg-primary hover:bg-primary/90 cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo producto
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-secondary/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Producto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Categoría</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Precio</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Ventas</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-border transition-colors hover:bg-secondary/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <span className="font-medium text-foreground">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{product.category}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          product.stock > 10 ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                        }`}>
                          {product.stock} unidades
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{product.sales}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="rounded-xl border border-border bg-card shadow-soft">
            <div className="border-b border-border p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SmartInput
                  type="search"
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  placeholder="Buscar órdenes..."
                  leftIcon={<Search className="h-4 w-4" />}
                  wrapperClassName="flex-1 min-w-0"
                  inputClassName="h-10 rounded-lg border-border bg-background py-2.5 text-sm shadow-none"
                />
                <Button variant="outline" className="rounded-lg cursor-pointer">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-secondary/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Orden</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Cliente</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border transition-colors hover:bg-secondary/20">
                      <td className="px-6 py-4 font-medium text-foreground">{order.number}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{order.customer}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{order.date}</td>
                      <td className="px-6 py-4">
                        <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="rounded-xl border border-border bg-card shadow-soft">
            <div className="border-b border-border p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SmartInput
                  type="search"
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  placeholder="Buscar usuarios..."
                  leftIcon={<Search className="h-4 w-4" />}
                  wrapperClassName="flex-1 min-w-0"
                  inputClassName="h-10 rounded-lg border-border bg-background py-2.5 text-sm shadow-none"
                />
                <Button variant="outline" className="rounded-lg cursor-pointer">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-secondary/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Usuario</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Tipo</th>
                    <th className=”px-6 py-4 text-left text-sm font-semibold text-foreground”>Se unió</th>
                    <th className=”px-6 py-4 text-left text-sm font-semibold text-foreground”>Órdenes</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border transition-colors hover:bg-secondary/20">
                      <td className="px-6 py-4 font-medium text-foreground">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          user.type === "seller" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {user.type === "seller" ? "Vendedor" : "Comprador"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{user.joinDate}</td>
                      <td className="px-6 py-4 font-medium text-foreground">{user.orders}</td>
                      <td className="px-6 py-4">
                        <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


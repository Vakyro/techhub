"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Settings,
  LogOut,
  Edit2,
  ShoppingBag,
  Star,
  Package,
  Clock,
  Check,
  Eye,
  Loader,
  Heart,
  Trash2,
  UserCircle,
  ShoppingCart,
  Minus,
  Plus,
  ListChecks,
  Link2,
  Lock,
  Globe,
  Plus as PlusIcon,
  X,
  Moon,
  Sun,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import {
  getUserOrders,
  getCart,
  removeFromCart,
  updateCartQuantity,
  getWishlist,
  removeFromWishlist,
  getUserSharedLists,
  createSharedList,
  updateSharedList,
  deleteSharedList,
} from "@/lib/supabase-queries"
import { useSession } from "@/components/SessionProvider"

type Order = {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  estimated_delivery: string
  order_items: Array<{
    product_id: string
    quantity: number
    products: { name: string; image_url: string }
  }>
}

type CartItem = {
  id: string
  quantity: number
  products: { id: string; name: string; image_url: string; price: number }
}

type WishlistItem = {
  id: string
  products: { id: string; name: string; image_url: string; price: number }
}

type TabType = "overview" | "orders" | "settings" | "carrito" | "wishlist" | "listas"

type SharedList = {
  id: string
  name: string
  is_shared: boolean
  share_token: string
  item_count: number
}

export default function PerfilPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, logout, theme, toggleTheme } = useSession()
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoadingCart, setIsLoadingCart] = useState(false)
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false)
  const [lists, setLists] = useState<SharedList[]>([])
  const [isLoadingLists, setIsLoadingLists] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [showNewList, setShowNewList] = useState(false)
  const [isCreatingList, setIsCreatingList] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [userData, setUserData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    ubicacion: "",
  })
  const [editData, setEditData] = useState(userData)

  useEffect(() => {
    if (!authLoading && user?.role === "seller") {
      router.replace("/vendedor")
      return
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!authLoading && user) {
      setUserData({
        nombre: user.nombre || "",
        email: user.email || "",
        telefono: user.telefono || "",
        ubicacion: "",
      })
      setEditData({
        nombre: user.nombre || "",
        email: user.email || "",
        telefono: user.telefono || "",
        ubicacion: "",
      })
      loadOrders()
      loadCart()
      loadWishlist()
    }
  }, [user, authLoading])

  const loadOrders = async () => {
    if (!user) return
    setIsLoadingOrders(true)
    try {
      const res = await getUserOrders(user.id)
      if (res.error) throw res.error
      setOrders(res.data || [])
    } catch (err) {
      console.error("Error loading orders:", err)
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const loadCart = async () => {
    if (!user) return
    setIsLoadingCart(true)
    try {
      const res = await getCart(user.id)
      if (res.error) throw res.error
      setCartItems(res.data || [])
    } catch (err) {
      console.error("Error loading cart:", err)
    } finally {
      setIsLoadingCart(false)
    }
  }

  const loadWishlist = async () => {
    if (!user) return
    setIsLoadingWishlist(true)
    try {
      const res = await getWishlist(user.id)
      if (res.error) throw res.error
      setWishlistItems(res.data || [])
    } catch (err) {
      console.error("Error loading wishlist:", err)
    } finally {
      setIsLoadingWishlist(false)
    }
  }

  const loadLists = async () => {
    if (!user) return
    setIsLoadingLists(true)
    const res = await getUserSharedLists(user.id)
    setLists((res.data ?? []) as SharedList[])
    setIsLoadingLists(false)
  }

  const handleCreateList = async () => {
    if (!user || !newListName.trim()) return
    setIsCreatingList(true)
    const { data } = await createSharedList(user.id, newListName.trim())
    if (data) {
      setLists((prev) => [{ id: data.id, name: data.name, is_shared: data.is_shared, share_token: data.share_token, item_count: 0 }, ...prev])
      setNewListName("")
      setShowNewList(false)
    }
    setIsCreatingList(false)
  }

  const handleToggleShare = async (list: SharedList) => {
    const { data } = await updateSharedList(list.id, { is_shared: !list.is_shared })
    if (data) {
      setLists((prev) => prev.map((l) => l.id === list.id ? { ...l, is_shared: !l.is_shared } : l))
    }
  }

  const handleDeleteList = async (listId: string) => {
    await deleteSharedList(listId)
    setLists((prev) => prev.filter((l) => l.id !== listId))
  }

  const SHARE_BASE_URL = "https://crafter-professed-cannon.ngrok-free.dev"

  const handleCopyListLink = (token: string) => {
    navigator.clipboard.writeText(`${SHARE_BASE_URL}/lista/${token}`)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const handleRemoveFromCart = async (cartId: string) => {
    if (!user) return
    try {
      await removeFromCart(user.id, cartId)
      setCartItems((prev) => prev.filter((item) => item.id !== cartId))
    } catch (err) {
      console.error("Error removing from cart:", err)
    }
  }

  const handleUpdateCartQuantity = async (cartId: string, newQuantity: number) => {
    if (!user || newQuantity < 1) return
    try {
      await updateCartQuantity(user.id, cartId, newQuantity)
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartId ? { ...item, quantity: newQuantity } : item
        )
      )
    } catch (err) {
      console.error("Error updating quantity:", err)
    }
  }

  const handleRemoveFromWishlist = async (wishlistId: string) => {
    if (!user) return
    try {
      await removeFromWishlist(user.id, wishlistId)
      setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistId))
    } catch (err) {
      console.error("Error removing from wishlist:", err)
    }
  }

  const handleSaveChanges = () => {
    setUserData(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(userData)
    setIsEditing(false)
  }

  const getStatusLabel = (status: Order["status"]) => {
    const labels = {
      pending: "Pendiente",
      confirmed: "Confirmada",
      processing: "Procesando",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelada",
    }
    return labels[status as keyof typeof labels] || status
  }

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-cyan-100 text-cyan-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-secondary text-secondary-foreground"
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return <Check className="h-4 w-4" />
      case "shipped":
        return <Package className="h-4 w-4" />
      case "processing":
        return <Clock className="h-4 w-4" />
      default:
        return <ShoppingBag className="h-4 w-4" />
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">No autorizado</h1>
          <p className="text-muted-foreground mb-4">Por favor inicia sesión para ver tu perfil</p>
          <Link href="/iniciar-sesion">
            <Button>Ir a iniciar sesión</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* Profile Header */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserCircle className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{userData.nombre}</h1>
                <p className="text-sm text-muted-foreground">{userData.email}</p>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="ghost"
              className="rounded-lg cursor-pointer"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-4 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Información
            </button>
            <button
              onClick={() => setActiveTab("carrito")}
              className={`pb-4 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "carrito"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Carrito
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`pb-4 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "wishlist"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Wishlist
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-4 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "orders"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Órdenes
            </button>
            <button
              onClick={() => { setActiveTab("listas"); if (lists.length === 0) void loadLists() }}
              className={`pb-4 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "listas"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mis listas
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`pb-4 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "settings"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Configuración
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Personal Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Información personal</h2>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={editData.nombre}
                        onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={editData.telefono}
                        onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        value={editData.ubicacion}
                        onChange={(e) => setEditData({ ...editData, ubicacion: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={handleSaveChanges}
                        className="flex-1 rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
                      >
                        Guardar cambios
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="flex-1 rounded-lg cursor-pointer"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Nombre</p>
                        <p className="text-foreground font-medium">{userData.nombre}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Correo</p>
                        <p className="text-foreground font-medium">{userData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Teléfono</p>
                        <p className="text-foreground font-medium">{userData.telefono}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Ubicación</p>
                        <p className="text-foreground font-medium">{userData.ubicacion}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <ShoppingBag className="mb-3 h-6 w-6 text-primary" />
                <p className="text-sm text-muted-foreground">Órdenes totales</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <Star className="mb-3 h-6 w-6 text-primary" />
                <p className="text-sm text-muted-foreground">Calificación</p>
                <p className="text-2xl font-bold text-foreground">4.8/5</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <Package className="mb-3 h-6 w-6 text-primary" />
                <p className="text-sm text-muted-foreground">En proceso</p>
                <p className="text-2xl font-bold text-foreground">1</p>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {isLoadingOrders ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center shadow-soft">
                <p className="text-muted-foreground">No tienes órdenes aún</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="rounded-xl border border-border bg-card p-6 shadow-soft hover:shadow-elevated transition-shadow">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-4">
                      <img loading="lazy"
                        src={order.order_items[0]?.products?.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=80&h=80&fit=crop"}
                        alt="Product"
                        className="h-20 w-20 rounded-lg object-cover bg-secondary"
                      />
                      <div>
                        <p className="text-sm text-muted-foreground">Pedido #{order.order_number}</p>
                        <p className="font-semibold text-foreground">${order.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{order.order_items.length} artículo(s) • {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </div>
                      <Link href={`/confirmacion-orden/${order.id}`}>
                        <Button variant="ghost" className="rounded-lg cursor-pointer">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Cart Tab */}
        {activeTab === "carrito" && (
          <div className="space-y-4">
            {isLoadingCart ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : cartItems.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center shadow-soft">
                <ShoppingCart className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="rounded-xl border border-border bg-card p-4 shadow-soft">
                      <div className="flex gap-4">
                        <img loading="lazy"
                          src={item.products?.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=80&h=80&fit=crop"}
                          alt={item.products?.name}
                          className="h-20 w-20 rounded-lg object-cover bg-secondary"
                        />
                        <div className="flex-1 min-w-0">
                          <Link href={`/producto/${item.products?.id}`}>
                            <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-2">
                              {item.products?.name}
                            </h3>
                          </Link>
                          <p className="text-lg font-bold text-primary mt-1">${(item.products?.price || 0).toFixed(2)}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() => handleUpdateCartQuantity(item.id, item.quantity - 1)}
                              className="rounded p-1 hover:bg-secondary transition-colors cursor-pointer"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-6 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateCartQuantity(item.id, item.quantity + 1)}
                              className="rounded p-1 hover:bg-secondary transition-colors cursor-pointer"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="ml-auto text-destructive hover:bg-destructive/10 rounded p-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">Subtotal:</p>
                    <p className="text-lg font-bold text-primary">
                      ${cartItems.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <Link href="/carrito">
                  <Button className="w-full rounded-lg bg-primary hover:bg-primary/90 cursor-pointer">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Ir al carrito completo
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === "wishlist" && (
          <div className="space-y-4">
            {isLoadingWishlist ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center shadow-soft">
                <Heart className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Tu wishlist está vacía</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-soft hover:shadow-elevated transition-all">
                    <div className="relative h-32 overflow-hidden bg-secondary">
                      <img loading="lazy"
                        src={item.products?.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop"}
                        alt={item.products?.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="p-4">
                      <Link href={`/producto/${item.products?.id}`}>
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-2 mb-2">
                          {item.products?.name}
                        </h3>
                      </Link>
                      <p className="text-lg font-bold text-primary mb-3">${(item.products?.price || 0).toFixed(2)}</p>
                      <div className="flex gap-2">
                        <Link href={`/producto/${item.products?.id}`} className="flex-1">
                          <Button variant="outline" className="w-full rounded-lg cursor-pointer text-sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </Link>
                        <button
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="text-destructive hover:bg-destructive/10 rounded-lg p-2 transition-colors cursor-pointer border border-border"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Cambiar contraseña</h3>
                  <p className="text-sm text-muted-foreground">Actualiza tu contraseña regularmente</p>
                </div>
                <Button variant="outline" className="rounded-lg cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Cambiar
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Notificaciones</h3>
                  <p className="text-sm text-muted-foreground">Gestiona tus preferencias de notificaciones</p>
                </div>
                <Button variant="outline" className="rounded-lg cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Dirección de envío</h3>
                  <p className="text-sm text-muted-foreground">Administra tus direcciones de envío</p>
                </div>
                <Button variant="outline" className="rounded-lg cursor-pointer">
                  <MapPin className="h-4 w-4 mr-2" />
                  Gestionar
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Tema de la aplicación</h3>
                  <p className="text-sm text-muted-foreground">
                    {theme === "dark" ? "Modo oscuro activo" : "Modo claro activo"}
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="relative inline-flex h-10 w-20 items-center rounded-full border border-border bg-secondary transition-colors hover:border-primary/50 cursor-pointer"
                  aria-label="Cambiar tema"
                >
                  <span
                    className={`absolute left-1 flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-soft transition-transform duration-300 ${
                      theme === "dark" ? "translate-x-10" : "translate-x-0"
                    }`}
                  >
                    {theme === "dark" ? (
                      <Moon className="h-4 w-4 text-primary" />
                    ) : (
                      <Sun className="h-4 w-4 text-primary" />
                    )}
                  </span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Cerrar sesión</h3>
                  <p className="text-sm text-muted-foreground">Salir de tu cuenta en este dispositivo</p>
                </div>
                <Button onClick={logout} variant="destructive" className="rounded-lg cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Listas Tab */}
        {activeTab === "listas" && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Mis listas</h2>
                <p className="text-sm text-muted-foreground">{lists.length} lista{lists.length !== 1 ? "s" : ""}</p>
              </div>
              <Button
                size="sm"
                className="rounded-xl bg-primary hover:bg-primary/90 cursor-pointer"
                onClick={() => setShowNewList(true)}
              >
                <PlusIcon className="mr-1.5 h-4 w-4" />
                Nueva lista
              </Button>
            </div>

            {/* Create list form */}
            {showNewList && (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-4 shadow-soft">
                <input
                  type="text"
                  placeholder="Nombre de la lista..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") void handleCreateList() }}
                  autoFocus
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button size="sm" className="rounded-lg bg-primary hover:bg-primary/90 cursor-pointer" onClick={() => void handleCreateList()} disabled={!newListName.trim() || isCreatingList}>
                  {isCreatingList ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
                <button onClick={() => { setShowNewList(false); setNewListName("") }} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Lists */}
            {isLoadingLists ? (
              <div className="flex justify-center py-12">
                <Loader className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : lists.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <ListChecks className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                <p className="font-medium text-foreground">Sin listas</p>
                <p className="mt-1 text-sm text-muted-foreground">Crea tu primera lista para guardar y compartir productos.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lists.map((list) => (
                  <div key={list.id} className="rounded-xl border border-border bg-card p-4 shadow-soft">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <ListChecks className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{list.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {list.item_count} producto{list.item_count !== 1 ? "s" : ""}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          {list.is_shared ? (
                            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                              <Globe className="h-2.5 w-2.5" />
                              Compartida
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              <Lock className="h-2.5 w-2.5" />
                              Privada
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1">
                        {/* Toggle share */}
                        <button
                          onClick={() => void handleToggleShare(list)}
                          title={list.is_shared ? "Hacer privada" : "Compartir"}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                        >
                          {list.is_shared ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                        </button>

                        {/* Copy link (only if shared) */}
                        {list.is_shared && (
                          <button
                            onClick={() => handleCopyListLink(list.share_token)}
                            title="Copiar enlace"
                            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-primary transition-colors cursor-pointer"
                          >
                            {copiedToken === list.share_token ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : (
                              <Link2 className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        {/* Open list */}
                        <a
                          href={`/lista/${list.share_token}`}
                          title="Abrir lista"
                          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </a>

                        {/* Delete */}
                        <button
                          onClick={() => void handleDeleteList(list.id)}
                          title="Eliminar lista"
                          className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Shared link preview */}
                    {list.is_shared && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                        <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <p className="truncate text-xs text-muted-foreground">
                          {SHARE_BASE_URL}/lista/{list.share_token}
                        </p>
                        <button
                          onClick={() => handleCopyListLink(list.share_token)}
                          className="ml-auto shrink-0 text-xs font-medium text-primary hover:underline cursor-pointer"
                        >
                          {copiedToken === list.share_token ? "Copiado" : "Copiar"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

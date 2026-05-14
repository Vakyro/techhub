"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Plus,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Eye,
  Activity,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Check,
  Loader,
  LogOut,
  Store,
  ChevronDown,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSession } from "@/components/SessionProvider"
import {
  getSellerByUserId,
  getAllSellerProducts,
  getSellerOrderItems,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  updateSellerProfile,
} from "@/lib/supabase-queries"

// ─── Types ────────────────────────────────────────────────────────────────────

type SellerInfo = {
  id: string
  store_name: string
  description: string | null
  location: string | null
  is_verified: boolean
  rating: number
}

type SellerProduct = {
  id: string
  name: string
  image_url: string
  price: number
  wholesale_price: number | null
  minimum_wholesale_quantity: number | null
  stock: number
  rating: number
  reviews_count: number
  is_active: boolean
  created_at: string
  categories: { id: string; name: string; slug: string } | null
  description: string
}

type OrderItem = {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  product_name: string
  order: {
    id: string
    order_number: string
    status: string
    total: number
    created_at: string
    customer_name: string
    customer_email: string
  } | null
}

type Category = { id: string; name: string; slug: string }

type Tab = "overview" | "productos" | "pedidos" | "tienda"

type ProductForm = {
  name: string
  category_id: string
  description: string
  image_url: string
  price: string
  wholesale_price: string
  minimum_wholesale_quantity: string
  stock: string
}

const EMPTY_FORM: ProductForm = {
  name: "",
  category_id: "",
  description: "",
  image_url: "",
  price: "",
  wholesale_price: "",
  minimum_wholesale_quantity: "10",
  stock: "",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(price)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
}

function getStockBadge(stock: number) {
  if (stock <= 0) return { label: "Agotado", className: "bg-destructive/10 text-destructive" }
  if (stock <= 5) return { label: "Stock bajo", className: "bg-amber-500/10 text-amber-600" }
  return { label: "En stock", className: "bg-primary/10 text-primary" }
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-secondary text-secondary-foreground" },
  processing: { label: "Procesando", className: "bg-amber-500/10 text-amber-600" },
  shipped: { label: "Enviado", className: "bg-[#84bcbf]/20 text-[#4a8c8f]" },
  completed: { label: "Completado", className: "bg-primary/10 text-primary" },
  cancelled: { label: "Cancelado", className: "bg-destructive/10 text-destructive" },
}

// ─── Product Form Modal ────────────────────────────────────────────────────────

function ProductFormModal({
  form,
  categories,
  isSaving,
  isEditing,
  onChange,
  onSave,
  onClose,
}: {
  form: ProductForm
  categories: Category[]
  isSaving: boolean
  isEditing: boolean
  onChange: (field: keyof ProductForm, value: string) => void
  onSave: () => void
  onClose: () => void
}) {
  const field = (label: string, key: keyof ProductForm, opts?: { type?: string; placeholder?: string; required?: boolean }) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {opts?.required !== false && <span className="text-destructive">*</span>}
      </label>
      <input
        type={opts?.type ?? "text"}
        value={form[key]}
        onChange={(e) => onChange(key, e.target.value)}
        placeholder={opts?.placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-y-auto rounded-2xl bg-card shadow-elevated" style={{ maxHeight: "90vh" }}>
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? "Editar producto" : "Agregar producto"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {field("Nombre del producto", "name", { placeholder: "ej. Arduino Uno R3" })}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Categoría <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <select
                value={form.category_id}
                onChange={(e) => onChange("category_id", e.target.value)}
                className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={3}
              placeholder="Describe tu producto..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">URL de imagen</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => onChange("image_url", e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {form.image_url ? (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                  <Image src={form.image_url} alt="preview" fill unoptimized className="object-cover" />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {field("Precio de venta (MXN)", "price", { type: "number", placeholder: "0.00" })}
            {field("Stock disponible", "stock", { type: "number", placeholder: "0" })}
          </div>

          <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">Precio mayoreo (opcional)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("Precio mayoreo (MXN)", "wholesale_price", { type: "number", placeholder: "0.00", required: false })}
              {field("Mínimo de piezas", "minimum_wholesale_quantity", { type: "number", placeholder: "10", required: false })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-border p-5">
          <Button variant="outline" className="flex-1 rounded-xl cursor-pointer" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button className="flex-1 rounded-xl bg-primary hover:bg-primary/90 cursor-pointer" onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <><Loader className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
            ) : (
              <><Check className="mr-2 h-4 w-4" />{isEditing ? "Guardar cambios" : "Publicar producto"}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function VendedorPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, logout, theme } = useSession()
  const logoSrc = theme === "dark" ? "/icon_dark.png" : "/icon.png"

  const [seller, setSeller] = useState<SellerInfo | null>(null)
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>("overview")

  // Product form
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null)
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState("")

  // Store settings
  const [storeForm, setStoreForm] = useState({ store_name: "", description: "", location: "" })
  const [isSavingStore, setIsSavingStore] = useState(false)
  const [storeSuccess, setStoreSuccess] = useState(false)

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace("/iniciar-sesion"); return }
    if (user.role !== "seller") { router.replace("/perfil"); return }
  }, [user, authLoading, router])

  // ── Load data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || user.role !== "seller") return
    const load = async () => {
      setIsLoading(true)
      const [sellerRes, catsRes] = await Promise.all([
        getSellerByUserId(user.id),
        getCategories(),
      ])
      if (sellerRes.data) {
        setSeller(sellerRes.data as SellerInfo)
        setStoreForm({
          store_name: sellerRes.data.store_name ?? "",
          description: sellerRes.data.description ?? "",
          location: sellerRes.data.location ?? "",
        })
        const [prodsRes, ordersRes] = await Promise.all([
          getAllSellerProducts(sellerRes.data.id),
          getSellerOrderItems(sellerRes.data.id),
        ])
        setProducts((prodsRes.data ?? []) as SellerProduct[])
        setOrderItems((ordersRes.data ?? []) as OrderItem[])
      }
      setCategories((catsRes.data ?? []) as Category[])
      setIsLoading(false)
    }
    void load()
  }, [user])

  // ── Product CRUD ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setFormError("")
    setShowForm(true)
  }

  const openEdit = (product: SellerProduct) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      category_id: product.categories?.id ?? "",
      description: product.description,
      image_url: product.image_url,
      price: String(product.price),
      wholesale_price: product.wholesale_price ? String(product.wholesale_price) : "",
      minimum_wholesale_quantity: product.minimum_wholesale_quantity ? String(product.minimum_wholesale_quantity) : "10",
      stock: String(product.stock),
    })
    setFormError("")
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!seller) return
    if (!form.name.trim()) { setFormError("El nombre es obligatorio"); return }
    if (!form.category_id) { setFormError("Selecciona una categoría"); return }
    if (!form.price || Number(form.price) <= 0) { setFormError("El precio debe ser mayor a 0"); return }
    if (!form.stock || Number(form.stock) < 0) { setFormError("El stock no puede ser negativo"); return }

    setIsSaving(true)
    setFormError("")

    if (editingProduct) {
      const res = await updateProduct(editingProduct.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        image_url: form.image_url.trim() || undefined,
        price: Number(form.price),
        wholesale_price: form.wholesale_price ? Number(form.wholesale_price) : undefined,
        minimum_wholesale_quantity: form.wholesale_price ? Number(form.minimum_wholesale_quantity) : undefined,
        stock: Number(form.stock),
      })
      if (res.error) { setFormError("Error al guardar. Intenta de nuevo."); setIsSaving(false); return }
    } else {
      const res = await createProduct(seller.id, {
        category_id: form.category_id,
        name: form.name.trim(),
        description: form.description.trim(),
        image_url: form.image_url.trim() || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
        price: Number(form.price),
        wholesale_price: form.wholesale_price ? Number(form.wholesale_price) : undefined,
        minimum_wholesale_quantity: form.wholesale_price ? Number(form.minimum_wholesale_quantity) : undefined,
        stock: Number(form.stock),
      })
      if (res.error) { setFormError("Error al crear el producto. Intenta de nuevo."); setIsSaving(false); return }
    }

    const prodsRes = await getAllSellerProducts(seller.id)
    setProducts((prodsRes.data ?? []) as SellerProduct[])
    setIsSaving(false)
    setShowForm(false)
  }

  const handleToggleActive = async (product: SellerProduct) => {
    await toggleProductActive(product.id, !product.is_active)
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_active: !p.is_active } : p))
  }

  const handleDelete = async (productId: string) => {
    await deleteProduct(productId)
    setProducts((prev) => prev.filter((p) => p.id !== productId))
    setDeletingId(null)
  }

  const handleSaveStore = async () => {
    if (!seller) return
    setIsSavingStore(true)
    await updateSellerProfile(seller.id, storeForm)
    setSeller((prev) => prev ? { ...prev, ...storeForm } : prev)
    setIsSavingStore(false)
    setStoreSuccess(true)
    setTimeout(() => setStoreSuccess(false), 2500)
  }

  // ── Loading / Auth ──────────────────────────────────────────────────────────
  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || user.role !== "seller" || !seller) return null

  // ── Derived stats ───────────────────────────────────────────────────────────
  const activeProducts = products.filter((p) => p.is_active)
  const lowStockProducts = products.filter((p) => p.is_active && p.stock <= 5)
  const totalStockValue = products.reduce((s, p) => s + p.price * p.stock, 0)
  const totalOrderItems = orderItems.length
  const totalRevenue = orderItems.reduce((s, i) => s + i.subtotal, 0)

  const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "productos", label: "Mis productos", icon: Package },
    { id: "pedidos", label: "Pedidos", icon: ShoppingCart },
    { id: "tienda", label: "Mi tienda", icon: Store },
  ]

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 border-r border-border/50 bg-card lg:flex flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border/50 px-5">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Image src={logoSrc} alt="techHub" width={36} height={36} className="h-9 w-auto" />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                activeTab === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-border/50 p-4 space-y-2">
          <div className="rounded-xl bg-secondary/50 p-3">
            <p className="text-xs font-medium text-foreground truncate">{seller.store_name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={() => void logout()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Top bar */}
      <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-border/50 bg-card/90 backdrop-blur-sm lg:left-60">
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Image src={logoSrc} alt="techHub" width={40} height={40} className="h-10 w-auto" />
            <span className="font-semibold text-foreground">Panel vendedor</span>
          </div>

          {/* Mobile nav */}
          <div className="flex items-center gap-1 overflow-x-auto lg:hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                  activeTab === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{seller.store_name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="rounded-xl bg-primary hover:bg-primary/90 cursor-pointer" onClick={openAdd}>
              <Plus className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Nuevo producto</span>
            </Button>
            <button
              onClick={() => void logout()}
              className="hidden lg:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16 lg:pl-60">
        <div className="p-4 lg:p-6">

          {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Bienvenido, {seller.store_name}</p>
              </div>

              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "Productos activos", value: String(activeProducts.length), icon: Package, color: "bg-primary/10 text-primary", sub: `${products.length} total` },
                  { title: "Valor en inventario", value: formatPrice(totalStockValue), icon: DollarSign, color: "bg-accent/30 text-accent-foreground", sub: "precio × stock" },
                  { title: "Ventas registradas", value: formatPrice(totalRevenue), icon: TrendingUp, color: "bg-[#84bcbf]/20 text-foreground", sub: `${totalOrderItems} líneas de pedido` },
                  { title: "Stock bajo", value: String(lowStockProducts.length), icon: AlertTriangle, color: "bg-amber-500/10 text-amber-600", sub: "productos con ≤5 unidades" },
                ].map((s) => (
                  <div key={s.title} className="rounded-xl bg-card p-5 shadow-soft">
                    <div className="mb-3 flex items-center justify-between">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", s.color)}>
                        <s.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.title}</p>
                    <p className="text-xl font-bold text-foreground">{s.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Low stock alert */}
              {lowStockProducts.length > 0 && (
                <div className="rounded-xl bg-card shadow-soft">
                  <div className="flex items-center gap-2 border-b border-border/50 p-4">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <h2 className="font-semibold text-foreground">Productos con stock bajo</h2>
                  </div>
                  <div className="divide-y divide-border/30">
                    {lowStockProducts.map((p) => {
                      const badge = getStockBadge(p.stock)
                      return (
                        <div key={p.id} className="flex items-center gap-4 p-4">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary/30">
                            <Image src={p.image_url} alt={p.name} fill unoptimized className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{formatPrice(p.price)}</p>
                          </div>
                          <span className={cn("rounded-lg px-2.5 py-1 text-xs font-medium", badge.className)}>
                            {p.stock} unidades
                          </span>
                          <Button size="sm" variant="outline" className="rounded-lg cursor-pointer" onClick={() => openEdit(p)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Recent products */}
              <div className="rounded-xl bg-card shadow-soft">
                <div className="flex items-center justify-between border-b border-border/50 p-4">
                  <h2 className="font-semibold text-foreground">Productos recientes</h2>
                  <Button size="sm" variant="ghost" className="rounded-lg text-primary cursor-pointer" onClick={() => setActiveTab("productos")}>
                    Ver todos
                  </Button>
                </div>
                <div className="divide-y divide-border/30">
                  {products.slice(0, 5).map((p) => {
                    const badge = getStockBadge(p.stock)
                    return (
                      <div key={p.id} className="flex items-center gap-4 p-4">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary/30">
                          <Image src={p.image_url} alt={p.name} fill unoptimized className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.categories?.name ?? "Sin categoría"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">{formatPrice(p.price)}</p>
                          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", badge.className)}>{badge.label}</span>
                        </div>
                        {!p.is_active && (
                          <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">Inactivo</span>
                        )}
                      </div>
                    )
                  })}
                  {products.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No tienes productos aún.{" "}
                      <button onClick={openAdd} className="text-primary underline cursor-pointer">Agrega tu primero</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTOS ────────────────────────────────────────────────── */}
          {activeTab === "productos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Mis productos</h1>
                  <p className="text-sm text-muted-foreground">{products.length} producto{products.length !== 1 ? "s" : ""}</p>
                </div>
                <Button className="rounded-xl bg-primary hover:bg-primary/90 cursor-pointer" onClick={openAdd}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar producto
                </Button>
              </div>

              {products.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                  <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 font-medium text-foreground">Sin productos</p>
                  <p className="mb-4 text-sm text-muted-foreground">Agrega tu primer producto para empezar a vender.</p>
                  <Button className="rounded-xl bg-primary hover:bg-primary/90 cursor-pointer" onClick={openAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar producto
                  </Button>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl bg-card shadow-soft">
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50 text-left">
                          <th className="px-5 py-3.5 text-xs font-medium text-muted-foreground">Producto</th>
                          <th className="px-5 py-3.5 text-xs font-medium text-muted-foreground">Categoría</th>
                          <th className="px-5 py-3.5 text-xs font-medium text-muted-foreground">Precio</th>
                          <th className="px-5 py-3.5 text-xs font-medium text-muted-foreground">Stock</th>
                          <th className="px-5 py-3.5 text-xs font-medium text-muted-foreground">Estado</th>
                          <th className="px-5 py-3.5 text-xs font-medium text-muted-foreground">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => {
                          const badge = getStockBadge(p.stock)
                          return (
                            <tr key={p.id} className={cn("border-b border-border/30 last:border-0 transition-colors", !p.is_active && "opacity-60")}>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary/30">
                                    <Image src={p.image_url} alt={p.name} fill unoptimized className="object-cover" />
                                  </div>
                                  <p className="max-w-[180px] truncate text-sm font-medium text-foreground">{p.name}</p>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-sm text-muted-foreground">{p.categories?.name ?? "—"}</td>
                              <td className="px-5 py-4">
                                <p className="text-sm font-semibold text-foreground">{formatPrice(p.price)}</p>
                                {p.wholesale_price && (
                                  <p className="text-xs text-primary">{formatPrice(p.wholesale_price)} may.</p>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                <span className={cn("rounded-lg px-2.5 py-1 text-xs font-medium", badge.className)}>
                                  {p.stock} uds.
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <button
                                  onClick={() => handleToggleActive(p)}
                                  className={cn(
                                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                                    p.is_active ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                  )}
                                >
                                  {p.is_active ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                                  {p.is_active ? "Activo" : "Inactivo"}
                                </button>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-1">
                                  <Link href={`/producto/${p.id}`} target="_blank">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg cursor-pointer">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg cursor-pointer" onClick={() => openEdit(p)}>
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  {deletingId === p.id ? (
                                    <div className="flex items-center gap-1">
                                      <Button size="sm" variant="destructive" className="h-8 rounded-lg text-xs cursor-pointer" onClick={() => handleDelete(p.id)}>
                                        Confirmar
                                      </Button>
                                      <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs cursor-pointer" onClick={() => setDeletingId(null)}>
                                        No
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 cursor-pointer" onClick={() => setDeletingId(p.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="divide-y divide-border/30 md:hidden">
                    {products.map((p) => {
                      const badge = getStockBadge(p.stock)
                      return (
                        <div key={p.id} className={cn("p-4", !p.is_active && "opacity-60")}>
                          <div className="flex gap-3">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary/30">
                              <Image src={p.image_url} alt={p.name} fill unoptimized className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.categories?.name ?? "—"}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground">{formatPrice(p.price)}</span>
                                <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", badge.className)}>{p.stock} uds.</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <button onClick={() => handleToggleActive(p)} className={cn("flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors cursor-pointer", p.is_active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground")}>
                              {p.is_active ? "Activo" : "Inactivo"}
                            </button>
                            <Button size="sm" variant="outline" className="rounded-lg cursor-pointer" onClick={() => openEdit(p)}><Edit2 className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="outline" className="rounded-lg text-destructive hover:bg-destructive/10 cursor-pointer" onClick={() => setDeletingId(p.id === deletingId ? null : p.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {deletingId === p.id && (
                            <div className="mt-2 flex gap-2">
                              <Button size="sm" variant="destructive" className="flex-1 rounded-lg cursor-pointer" onClick={() => handleDelete(p.id)}>Eliminar</Button>
                              <Button size="sm" variant="outline" className="flex-1 rounded-lg cursor-pointer" onClick={() => setDeletingId(null)}>Cancelar</Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PEDIDOS ───────────────────────────────────────────────────── */}
          {activeTab === "pedidos" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
                <p className="text-sm text-muted-foreground">{orderItems.length} línea{orderItems.length !== 1 ? "s" : ""} de pedido</p>
              </div>

              {orderItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                  <ShoppingCart className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                  <p className="font-medium text-foreground">Sin pedidos aún</p>
                  <p className="mt-1 text-sm text-muted-foreground">Cuando alguien compre tus productos, aparecerán aquí.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl bg-card shadow-soft">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50 text-left">
                          <th className="px-5 py-3.5 text-xs font-medium text-muted-foreground">Pedido</th>
                          <th className="px-5 py-3.5 text-xs font-medium text-muted-foreground">Cliente</th>
                          <th className="px-5 py-3.5 text-xs font-medium text-muted-foreground">Producto</th>
                          <th className="px-5 py-3.5 text-xs font-medium text-muted-foreground">Cant.</th>
                          <th className="px-5 py-3.5 text-xs font-medium text-muted-foreground">Subtotal</th>
                          <th className="px-5 py-3.5 text-xs font-medium text-muted-foreground">Estado</th>
                          <th className="px-5 py-3.5 text-xs font-medium text-muted-foreground">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item) => {
                          const status = item.order?.status ?? "pending"
                          const st = STATUS_MAP[status] ?? STATUS_MAP.pending
                          return (
                            <tr key={item.id} className="border-b border-border/30 last:border-0">
                              <td className="px-5 py-4 text-sm font-medium text-foreground">
                                {item.order?.order_number ?? "—"}
                              </td>
                              <td className="px-5 py-4">
                                <p className="text-sm text-foreground">{item.order?.customer_name ?? "—"}</p>
                                <p className="text-xs text-muted-foreground">{item.order?.customer_email ?? ""}</p>
                              </td>
                              <td className="px-5 py-4 text-sm text-foreground max-w-[160px] truncate">{item.product_name}</td>
                              <td className="px-5 py-4 text-sm text-foreground">{item.quantity}</td>
                              <td className="px-5 py-4 text-sm font-semibold text-foreground">{formatPrice(item.subtotal)}</td>
                              <td className="px-5 py-4">
                                <span className={cn("rounded-lg px-2.5 py-1 text-xs font-medium", st.className)}>{st.label}</span>
                              </td>
                              <td className="px-5 py-4 text-xs text-muted-foreground">
                                {item.order?.created_at ? formatDate(item.order.created_at) : "—"}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TIENDA ────────────────────────────────────────────────────── */}
          {activeTab === "tienda" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Mi tienda</h1>
                <p className="text-sm text-muted-foreground">Actualiza la información de tu tienda</p>
              </div>

              <div className="max-w-xl rounded-xl bg-card p-6 shadow-soft">
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{seller.store_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {seller.is_verified ? (
                        <span className="flex items-center gap-1 text-xs text-primary">
                          <Check className="h-3 w-3" />Verificado
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin verificar</span>
                      )}
                      {seller.rating > 0 && (
                        <span className="text-xs text-muted-foreground">· {seller.rating.toFixed(1)} ★</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Nombre de la tienda</label>
                    <input
                      type="text"
                      value={storeForm.store_name}
                      onChange={(e) => setStoreForm((f) => ({ ...f, store_name: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Descripción</label>
                    <textarea
                      value={storeForm.description}
                      onChange={(e) => setStoreForm((f) => ({ ...f, description: e.target.value }))}
                      rows={3}
                      placeholder="Describe tu tienda..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Ubicación</label>
                    <input
                      type="text"
                      value={storeForm.location}
                      onChange={(e) => setStoreForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="ej. Tijuana, BC"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      className="flex-1 rounded-xl bg-primary hover:bg-primary/90 cursor-pointer"
                      onClick={handleSaveStore}
                      disabled={isSavingStore}
                    >
                      {isSavingStore ? (
                        <><Loader className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
                      ) : storeSuccess ? (
                        <><Check className="mr-2 h-4 w-4" />Guardado</>
                      ) : (
                        "Guardar cambios"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Account info */}
              <div className="max-w-xl rounded-xl bg-card p-6 shadow-soft">
                <h3 className="mb-4 font-semibold text-foreground">Información de cuenta</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Correo electrónico</span>
                    <span className="font-medium text-foreground">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo de cuenta</span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Vendedor</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total de productos</span>
                    <span className="font-medium text-foreground">{products.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Product Form Modal */}
      {showForm && (
        <ProductFormModal
          form={form}
          categories={categories}
          isSaving={isSaving}
          isEditing={!!editingProduct}
          onChange={(field, value) => {
            setForm((f) => ({ ...f, [field]: value }))
            setFormError("")
          }}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Form error toast */}
      {formError && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-destructive px-4 py-3 text-sm text-destructive-foreground shadow-elevated">
          {formError}
        </div>
      )}
    </div>
  )
}

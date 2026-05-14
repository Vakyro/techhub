"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Truck,
  Download,
  MessageCircle,
  Loader,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getOrderById } from "@/lib/supabase-queries"

type OrderItem = {
  id: string
  name: string
  quantity: number
  price: number
  image: string
}

type OrderDetail = {
  id: string
  order_number: string
  status: string
  subtotal: number
  shipping_cost: number
  tax: number
  total: number
  shipping_method: string
  payment_method: string
  notes: string | null
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_postal_code: string
  customer_name: string
  customer_phone: string
  customer_email: string
  tracking_number: string | null
  estimated_delivery: string | null
  created_at: string
  order_items: OrderItem[]
}

function getStatusColor(status: string) {
  switch (status) {
    case "delivered":
      return "text-green-600 bg-green-50"
    case "shipped":
      return "text-blue-600 bg-blue-50"
    case "processing":
      return "text-yellow-600 bg-yellow-50"
    case "confirmed":
      return "text-cyan-600 bg-cyan-50"
    case "cancelled":
      return "text-red-600 bg-red-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    delivered: "Entregado",
    shipped: "En tránsito",
    processing: "Procesando",
    confirmed: "Confirmado",
    pending: "Pendiente",
    cancelled: "Cancelado",
  }
  return labels[status] || status
}

function getPaymentLabel(paymentMethod: string) {
  const labels: Record<string, string> = {
    transfer: "Transferencia bancaria",
    cash_on_delivery: "Pago contra entrega",
    pickup_payment: "Pago al recoger",
    card: "Tarjeta",
    crypto: "Cripto",
  }
  return labels[paymentMethod] || paymentMethod
}

function getCryptoLabel(notes: string | null) {
  if (!notes || !notes.startsWith("crypto|")) return null

  const assetMatch = notes.match(/asset=([^|]+)/)
  const walletMatch = notes.match(/wallet=([^|]+)/)
  const asset = assetMatch?.[1] || "Cripto"
  const wallet = walletMatch?.[1] || "Wallet"

  return `${asset} via ${wallet}`
}

export default function ConfirmacionOrdenPage() {
  const params = useParams()
  const orderId = String(params.id)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadOrder = async () => {
      setIsLoading(true)
      setError("")

      try {
        const response = await getOrderById(orderId)
        if (response.error) throw response.error
        if (!response.data) throw new Error("Orden no encontrada")

        setOrder(response.data as OrderDetail)
      } catch (loadError) {
        console.error(loadError)
        setError("No se pudo cargar la orden")
      } finally {
        setIsLoading(false)
      }
    }

    void loadOrder()
  }, [orderId])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="navbar-solid shadow-soft">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2 cursor-pointer">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">techHub</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">{error}</h1>
            <Link href="/perfil">
              <Button className="mt-4 rounded-lg bg-primary hover:bg-primary/90 cursor-pointer">
                Volver al perfil
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="navbar-solid shadow-soft">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">techHub</span>
            </Link>
            <Link href="/perfil">
              <Button variant="ghost" className="rounded-lg cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a órdenes
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8 rounded-xl border border-border bg-card p-8 text-center shadow-soft">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Orden registrada</h1>
          <p className="text-muted-foreground">
            Aquí está el resumen real de tu compra.
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <p className="mb-1 text-sm text-muted-foreground">Número de orden</p>
            <p className="text-lg font-semibold text-foreground">{order.order_number}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <p className="mb-1 text-sm text-muted-foreground">Fecha</p>
            <p className="text-lg font-semibold text-foreground">
              {new Date(order.created_at).toLocaleDateString("es-MX")}
            </p>
          </div>
          <div className={`rounded-xl border border-border p-4 shadow-soft ${getStatusColor(order.status)}`}>
            <p className="mb-1 text-sm font-medium">Estado</p>
            <p className="text-lg font-semibold">{getStatusLabel(order.status)}</p>
          </div>
        </div>

        {order.tracking_number && (
          <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Seguimiento de envío</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Número de seguimiento</p>
                <p className="font-mono text-foreground">{order.tracking_number}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Entrega estimada</p>
                <p className="font-semibold text-foreground">
                  {order.estimated_delivery
                    ? new Date(order.estimated_delivery).toLocaleDateString("es-MX")
                    : "Por confirmar"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Artículos pedidos</h2>
          <div className="space-y-4">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-border pb-4 last:border-0">
                <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover bg-secondary" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">${item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Resumen de pago</h2>
          <div className="mb-4 space-y-3 border-b border-border pb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span className="font-medium text-foreground">${order.shipping_cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Impuestos</span>
              <span className="font-medium text-foreground">${order.tax.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-lg font-semibold text-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Dirección de envío</h2>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{order.customer_name}</p>
              <p>{order.shipping_address}</p>
              <p>
                {order.shipping_city}, {order.shipping_state}
              </p>
              <p>{order.shipping_postal_code}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Método de pago</h2>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                {getCryptoLabel(order.notes) || getPaymentLabel(order.payment_method)}
              </p>
              <p className="font-medium text-foreground">Método de envío: {order.shipping_method}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Información de contacto</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Correo electrónico</p>
                <p className="text-foreground">{order.customer_email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="text-foreground">{order.customer_phone}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1 rounded-lg bg-primary hover:bg-primary/90 cursor-pointer">
            <Download className="mr-2 h-4 w-4" />
            Descargar recibo
          </Button>
          <Button variant="outline" className="flex-1 rounded-lg cursor-pointer">
            <MessageCircle className="mr-2 h-4 w-4" />
            Contactar soporte
          </Button>
          <Link href="/productos" className="flex-1">
            <Button variant="outline" className="w-full rounded-lg cursor-pointer">
              Seguir comprando
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

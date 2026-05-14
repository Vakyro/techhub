"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Check,
  Coins,
  Copy,
  CreditCard,
  Loader,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getCart, createOrder, addOrderItems, clearCart } from "@/lib/supabase-queries"
import { useSession } from "@/components/SessionProvider"

type CartItem = {
  id: string
  product_id: string
  quantity: number
  products: {
    id: string
    seller_id: string
    name: string
    image_url: string
    price: number
    wholesale_price: number | null
    minimum_wholesale_quantity: number | null
  } | null
}

type Step = "shipping" | "payment" | "confirmation"
type PaymentMethod = "transfer" | "cash" | "credit" | "crypto"

const cryptoAssets = [
  { value: "USDT", label: "USDT", rate: 1 },
  { value: "USDC", label: "USDC", rate: 1 },
  { value: "ETH", label: "ETH", rate: 3200 },
  { value: "BTC", label: "BTC", rate: 62000 },
] as const

const cryptoWallets = [
  { id: "metamask", name: "MetaMask" },
  { id: "trust", name: "Trust Wallet" },
  { id: "coinbase", name: "Coinbase Wallet" },
  { id: "phantom", name: "Phantom" },
] as const

type FormState = {
  nombre: string
  email: string
  telefono: string
  direccion: string
  ciudad: string
  estado: string
  codigoPostal: string
  shippingMethod: "standard" | "express" | "local"
  paymentMethod: PaymentMethod
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useSession()
  const [currentStep, setCurrentStep] = useState<Step>("shipping")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isConfirmingCrypto, setIsConfirmingCrypto] = useState(false)
  const [error, setError] = useState("")
  const [orderId, setOrderId] = useState("")
  const [selectedCryptoAsset, setSelectedCryptoAsset] = useState<(typeof cryptoAssets)[number]["value"]>("USDT")
  const [selectedCryptoWallet, setSelectedCryptoWallet] = useState<(typeof cryptoWallets)[number]["id"]>("metamask")

  const [formData, setFormData] = useState<FormState>({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    shippingMethod: "standard",
    paymentMethod: "transfer",
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/iniciar-sesion")
      return
    }

    if (user) {
      void loadCart()
    }
  }, [authLoading, router, user])

  const loadCart = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const res = await getCart(user.id)
      if (res.error) throw res.error
      if (!res.data || res.data.length === 0) {
        router.push("/carrito")
        return
      }
      setCartItems(res.data)
    } catch {
      setError("Error al cargar el carrito")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((current) => ({
      ...current,
      [name]: name === "paymentMethod" ? (value as PaymentMethod) : value,
    }))
  }

  const shippingCosts = {
    standard: 79,
    express: 149,
    local: 0,
  }

  const subtotal = cartItems.reduce((sum, item) => {
    if (!item.products) return sum
    const isWholesale = item.quantity >= (item.products.minimum_wholesale_quantity || 10)
    const price = isWholesale && item.products.wholesale_price ? item.products.wholesale_price : item.products.price
    return sum + price * item.quantity
  }, 0)

  const shipping = shippingCosts[formData.shippingMethod]
  const tax = subtotal * 0.05
  const total = subtotal + shipping + tax
  const selectedAsset = cryptoAssets.find((asset) => asset.value === selectedCryptoAsset) || cryptoAssets[0]
  const selectedWallet = cryptoWallets.find((wallet) => wallet.id === selectedCryptoWallet) || cryptoWallets[0]
  const cryptoAmount = selectedAsset.rate > 0 ? total / selectedAsset.rate : 0

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsProcessing(true)
    setError("")

    try {
      const estimatedDelivery = new Date()
      if (formData.shippingMethod === "express") {
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 2)
      } else if (formData.shippingMethod === "standard") {
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 6)
      } else {
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 1)
      }

      const notes =
        formData.paymentMethod === "crypto"
          ? `crypto|asset=${selectedAsset.value}|wallet=${selectedWallet.name}|amount=${cryptoAmount.toFixed(8)}`
          : undefined

      const orderRes = await createOrder(user.id, {
        customer_name: formData.nombre,
        customer_email: formData.email,
        customer_phone: formData.telefono,
        subtotal,
        shipping_cost: shipping,
        tax,
        total,
        shipping_method: formData.shippingMethod === "local" ? "pickup" : formData.shippingMethod,
        payment_method:
          formData.paymentMethod === "cash"
            ? "cash_on_delivery"
            : formData.paymentMethod === "credit"
              ? "card"
              : formData.paymentMethod === "crypto"
                ? "card"
                : "transfer",
        shipping_address: formData.direccion,
        shipping_city: formData.ciudad,
        shipping_state: formData.estado,
        shipping_postal_code: formData.codigoPostal,
        estimated_delivery: estimatedDelivery.toISOString().split("T")[0],
        notes,
      })

      if (orderRes.error) throw orderRes.error
      if (!orderRes.data) throw new Error("No se creó la orden")

      const itemsToAdd = cartItems.flatMap((item) => {
        if (!item.products) return []
        const isWholesale = item.quantity >= (item.products.minimum_wholesale_quantity || 10)
        const price = isWholesale && item.products.wholesale_price ? item.products.wholesale_price : item.products.price

        return {
          product_id: item.product_id,
          seller_id: item.products.seller_id,
          product_name: item.products.name,
          quantity: item.quantity,
          unit_price: price,
          price_type: isWholesale ? "wholesale" : "retail",
          subtotal: price * item.quantity,
        }
      })

      const itemsRes = await addOrderItems(orderRes.data.id, itemsToAdd)
      if (itemsRes.error) throw itemsRes.error

      await clearCart(user.id)
      setOrderId(orderRes.data.id)
      window.scrollTo({ top: 0 })
      setCurrentStep("confirmation")
    } catch (submitError) {
      setError("Error al procesar la orden")
      console.error(submitError)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmCrypto = () => {
    setIsConfirmingCrypto(true)
    window.setTimeout(() => {
      setIsConfirmingCrypto(false)
    }, 1400)
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {currentStep === "confirmation" ? (
            <div className="mx-auto max-w-2xl">
              <div className="rounded-xl border border-border bg-card p-8 text-center shadow-soft">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-foreground">Orden confirmada</h1>
                <p className="mt-2 text-muted-foreground">Tu pedido ha sido procesado exitosamente</p>
                <Link href={`/confirmacion-orden/${orderId}`} className="mt-6 inline-block">
                  <Button className="rounded-lg bg-primary hover:bg-primary/90 cursor-pointer">Ver detalles de orden</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
                </div>

                <form onSubmit={handleSubmitOrder} className="space-y-6">
                  {currentStep === "shipping" && (
                    <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                      <h2 className="mb-4 text-lg font-semibold text-foreground">Dirección de envío</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Nombre</label>
                          <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            placeholder="Tu nombre"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="tu@email.com"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Teléfono</label>
                          <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleInputChange}
                            placeholder="+52 664 123 4567"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Dirección</label>
                          <input
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleInputChange}
                            placeholder="Calle y número"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Ciudad</label>
                            <input
                              type="text"
                              name="ciudad"
                              value={formData.ciudad}
                              onChange={handleInputChange}
                              placeholder="Ciudad"
                              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                              required
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Estado</label>
                            <input
                              type="text"
                              name="estado"
                              value={formData.estado}
                              onChange={handleInputChange}
                              placeholder="Estado"
                              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Código postal</label>
                          <input
                            type="text"
                            name="codigoPostal"
                            value={formData.codigoPostal}
                            onChange={handleInputChange}
                            placeholder="22000"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                            required
                          />
                        </div>
                      </div>

                      <h3 className="mb-4 mt-6 font-semibold text-foreground">Método de envío</h3>
                      <div className="space-y-3">
                        {[
                          { value: "standard", label: "Estándar", cost: 79, days: "5-7" },
                          { value: "express", label: "Express", cost: 149, days: "2-3" },
                          { value: "local", label: "Local", cost: 0, days: "1-2" },
                        ].map((method) => (
                          <label key={method.value} className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-secondary transition-colors">
                            <input
                              type="radio"
                              name="shippingMethod"
                              value={method.value}
                              checked={formData.shippingMethod === method.value}
                              onChange={handleInputChange}
                              className="cursor-pointer"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{method.label}</p>
                              <p className="text-sm text-muted-foreground">{method.days} días</p>
                            </div>
                            <p className="font-semibold text-primary">${method.cost}</p>
                          </label>
                        ))}
                      </div>

                      <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <Coins className="h-4 w-4 text-primary" />
                              <p className="text-sm font-semibold text-foreground">Pago con cripto disponible</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Selecciona cripto en el siguiente paso para conectar wallet, elegir moneda y revisar el importe exacto.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-lg border-primary/20 bg-background cursor-pointer"
                            onClick={() => {
                              setFormData((current) => ({ ...current, paymentMethod: "crypto" }))
                              setCurrentStep("payment")
                            }}
                          >
                            Probar cripto
                          </Button>
                        </div>
                      </div>

                      <Button type="button" onClick={() => setCurrentStep("payment")} className="mt-6 w-full rounded-lg bg-primary hover:bg-primary/90 cursor-pointer">
                        Continuar a pago
                      </Button>
                    </div>
                  )}

                  {currentStep === "payment" && (
                    <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                      <h2 className="mb-4 text-lg font-semibold text-foreground">Método de pago</h2>

                      <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-start gap-3">
                          <Coins className="mt-0.5 h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">Cripto disponible en esta compra</p>
                            <p className="text-sm text-muted-foreground">
                              MetaMask, Trust Wallet, Coinbase Wallet y Phantom son compatibles con este flujo.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6 space-y-3">
                        {[
                          { value: "transfer", label: "Transferencia bancaria", icon: CreditCard, hint: "SPEI y depósito directo" },
                          { value: "cash", label: "Pago en efectivo", icon: Truck, hint: "Contra entrega o en sucursal" },
                          { value: "credit", label: "Tarjeta de crédito", icon: Lock, hint: "Cobro seguro con terminal" },
                          { value: "crypto", label: "Cripto", icon: Coins, hint: "Conecta tu wallet y confirma la red" },
                        ].map((method) => (
                          <label key={method.value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary">
                            <input type="radio" name="paymentMethod" value={method.value} checked={formData.paymentMethod === method.value} onChange={handleInputChange} className="cursor-pointer" />
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                                <method.icon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{method.label}</p>
                                <p className="text-xs text-muted-foreground">{method.hint}</p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>

                      {formData.paymentMethod === "crypto" && (
                        <div className="mb-6 rounded-xl border border-border bg-gradient-to-br from-primary/5 via-background to-secondary/30 p-4 shadow-soft">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                              <div className="mb-1 flex items-center gap-2">
                                <Coins className="h-5 w-5 text-primary" />
                                <h3 className="text-base font-semibold text-foreground">Pago en cripto</h3>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Revisa la wallet, la moneda y el monto antes de confirmar.
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              <Sparkles className="h-3.5 w-3.5" />
                              Web3
                            </span>
                          </div>

                          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="space-y-4">
                              <div className="rounded-xl border border-border bg-card p-4">
                                <div className="mb-3 flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-foreground">Selecciona wallet</p>
                                    <p className="text-xs text-muted-foreground">MetaMask, Trust Wallet, Coinbase Wallet y Phantom</p>
                                  </div>
                                  <Wallet className="h-5 w-5 text-primary" />
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {cryptoWallets.map((wallet) => (
                                    <button
                                      key={wallet.id}
                                      type="button"
                                      onClick={() => setSelectedCryptoWallet(wallet.id)}
                                      className={`rounded-lg border p-3 text-left transition-colors cursor-pointer ${
                                        selectedCryptoWallet === wallet.id ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-secondary"
                                      }`}
                                    >
                                      <p className="font-medium text-foreground">{wallet.name}</p>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="rounded-xl border border-border bg-card p-4">
                                <div className="mb-3 flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-foreground">Moneda y red</p>
                                    <p className="text-xs text-muted-foreground">Ejemplos: BTC, ETH, USDT y USDC</p>
                                  </div>
                                  <Coins className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {cryptoAssets.map((asset) => (
                                    <button
                                      key={asset.value}
                                      type="button"
                                      onClick={() => setSelectedCryptoAsset(asset.value)}
                                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors cursor-pointer ${
                                        selectedCryptoAsset === asset.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-secondary"
                                      }`}
                                    >
                                      {asset.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="rounded-xl border border-border bg-card p-4">
                              <div className="mb-3 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="text-sm font-medium text-foreground">Cobro esperado</p>
                                  <p className="text-xs text-muted-foreground">Importe actualizado al instante</p>
                                </div>
                              </div>

                              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                                <div className="mx-auto mb-4 flex h-36 w-36 items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-background">
                                  <div className="text-center">
                                    <Coins className="mx-auto mb-2 h-10 w-10 text-primary" />
                                    <p className="text-xs font-medium text-muted-foreground">QR de cobro</p>
                                    <p className="text-[11px] text-muted-foreground">Esperando confirmación</p>
                                  </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total USD</span>
                                    <span className="font-medium text-foreground">${total.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Estimado en {selectedAsset.label}</span>
                                    <span className="font-semibold text-primary">
                                      {cryptoAmount.toFixed(selectedAsset.value === "BTC" ? 6 : selectedAsset.value === "ETH" ? 4 : 2)} {selectedAsset.label}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2">
                                    <div>
                                      <p className="text-xs text-muted-foreground">Wallet seleccionada</p>
                                      <p className="font-medium text-foreground">{selectedWallet.name}</p>
                                    </div>
                                    <Copy className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </div>

                                <Button
                                  type="button"
                                  onClick={handleConfirmCrypto}
                                  disabled={isConfirmingCrypto}
                                  className="mt-4 w-full rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
                                >
                                  {isConfirmingCrypto ? (
                                    <>
                                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                      Confirmando en red...
                                    </>
                                  ) : (
                                    <>
                                      <Coins className="mr-2 h-4 w-4" />
                                      Confirmar cripto
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button type="button" onClick={() => setCurrentStep("shipping")} variant="outline" className="flex-1 rounded-lg cursor-pointer">
                          Atrás
                        </Button>
                        <Button type="submit" disabled={isProcessing} className="flex-1 rounded-lg bg-primary hover:bg-primary/90 cursor-pointer">
                          {isProcessing ? "Procesando..." : "Confirmar orden"}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <div className="sticky top-4 h-fit rounded-xl border border-border bg-card p-6 shadow-soft">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Resumen de orden</h3>
                <div className="mb-4 space-y-3 border-b border-border pb-4">
                  {cartItems.map((item) =>
                    item.products ? (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.products.name} x{item.quantity}
                        </span>
                        <span className="font-medium text-foreground">
                          ${(
                            item.quantity *
                            ((item.quantity >= (item.products.minimum_wholesale_quantity || 10) && item.products.wholesale_price) ||
                              item.products.price)
                          ).toFixed(2)}
                        </span>
                      </div>
                    ) : null
                  )}
                </div>

                <div className="mb-4 space-y-2 border-b border-border pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="font-medium text-foreground">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impuestos</span>
                    <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

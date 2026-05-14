"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Store, Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { loginUser } from "@/lib/supabase-queries"

type UserType = "usuario" | "comprador" | null

export default function IniciarSesionPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<UserType>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("registered") === "true") {
      setSuccessMessage("Cuenta creada exitosamente. Por favor revisa tu correo para confirmar tu cuenta.")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Por favor completa todos los campos")
      return
    }

    setIsLoading(true)
    try {
      const { data, error: loginError } = await loginUser(email, password)

      if (loginError || !data) {
        setError("Email o contraseña incorrectos")
        setIsLoading(false)
        return
      }

      const user = {
        id: data.id,
        email: data.email,
        nombre: data.full_name || data.email,
        telefono: data.phone || "",
        role: data.role,
        user_type:
          data.role === "seller"
            ? "vendedor"
            : data.role === "admin"
              ? "admin"
              : "usuario",
      }

      localStorage.setItem("session", JSON.stringify(user))
      document.cookie = `techhub_session=${encodeURIComponent(
        JSON.stringify({
          id: user.id,
          role: user.role,
        })
      )}; path=/; max-age=2592000; samesite=lax`
      window.dispatchEvent(new Event("session-update"))
      router.push("/")
    } catch (err) {
      setError("Error al iniciar sesión. Por favor intenta de nuevo")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
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

      <main className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
            Iniciar sesión
          </h1>
          <p className="text-muted-foreground">
            Selecciona tu tipo de cuenta para continuar
          </p>
        </div>

        {/* User Type Selection */}
        {!userType ? (
          <div className="space-y-4">
            <button
              onClick={() => setUserType("usuario")}
              className="group w-full rounded-xl border border-border bg-card p-6 text-left shadow-soft transition-all hover:border-primary/50 hover:shadow-elevated cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-foreground">Usuario</h3>
                  <p className="text-sm text-muted-foreground">
                    Compra componentes, kits y herramientas para tus proyectos maker. Accede a precios de mayoreo y ofertas exclusivas.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setUserType("comprador")}
              className="group w-full rounded-xl border border-border bg-card p-6 text-left shadow-soft transition-all hover:border-primary/50 hover:shadow-elevated cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/30 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Store className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-foreground">Vendedor</h3>
                  <p className="text-sm text-muted-foreground">
                    Cuenta empresarial para compras al mayoreo. Accede a precios preferenciales, facturación y crédito comercial.
                  </p>
                </div>
              </div>
            </button>

            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link href="/registro" className="font-medium text-primary hover:underline cursor-pointer">
                  Crear cuenta
                </Link>
              </p>
            </div>
          </div>
        ) : (
          /* Login Form */
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            {/* Selected Type Header */}
            <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
              <button
                onClick={() => setUserType(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                userType === "usuario" ? "bg-primary/10 text-primary" : "bg-accent/30 text-foreground"
              )}>
                {userType === "usuario" ? <User className="h-5 w-5" /> : <Store className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {userType === "usuario" ? "Usuario" : "Vendedor"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {userType === "usuario" ? "Cuenta personal" : "Cuenta de vendedor"}
                </p>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 rounded-lg bg-green-50 p-4 border border-green-200">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-lg bg-destructive/10 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Form Fields */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer" />
                  <span className="text-sm text-muted-foreground">Recordarme</span>
                </label>
                <Link href="/recuperar-contrasena" className="text-sm font-medium text-primary hover:underline cursor-pointer">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">o continúa con</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="rounded-lg cursor-pointer">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" className="rounded-lg cursor-pointer">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link href="/registro" className="font-medium text-primary hover:underline cursor-pointer">
                  Crear cuenta
                </Link>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

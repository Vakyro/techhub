"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Search,
  Sparkles,
  LayoutGrid,
  Clapperboard,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSession } from "@/components/SessionProvider"
import { getCart, searchProducts } from "@/lib/supabase-queries"

type Suggestion = {
  id: string
  name: string
  image_url: string
  price: number
}

const navigation = [
  { name: "Productos", href: "/productos", icon: LayoutGrid },
  { name: "Asistente IA", href: "/asistente", icon: Sparkles },
  { name: "TechReels", href: "/reels", icon: Clapperboard },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [cartItemCount, setCartItemCount] = useState(0)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const desktopSearchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, logout } = useSession()

  useEffect(() => {
    const loadCartCount = async () => {
      if (!user) {
        setCartItemCount(0)
        return
      }

      const response = await getCart(user.id)
      if (response.error || !response.data) {
        setCartItemCount(0)
        return
      }

      const count = response.data.reduce((sum, item) => sum + item.quantity, 0)
      setCartItemCount(count)
    }

    const handleCartUpdated = () => {
      void loadCartCount()
    }

    void loadCartCount()
    window.addEventListener("cart-updated", handleCartUpdated)

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated)
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(target) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(target)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleQueryChange = (value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      const { data } = await searchProducts(value.trim())
      setSuggestions(data.slice(0, 6) as Suggestion[])
      setShowSuggestions(data.length > 0)
    }, 280)
  }

  // Ghost text: first suggestion that starts with the current query
  const ghostCompletion = useMemo(() => {
    const q = searchQuery.trim()
    if (!q || suggestions.length === 0) return ""
    const lower = q.toLowerCase()
    const match = suggestions.find((s) => s.name.toLowerCase().startsWith(lower))
    if (!match || match.name.toLowerCase() === lower) return ""
    return match.name.slice(searchQuery.length)
  }, [searchQuery, suggestions])

  const acceptGhost = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      ghostCompletion &&
      (e.key === "Tab" ||
        (e.key === "ArrowRight" && e.currentTarget.selectionStart === searchQuery.length))
    ) {
      e.preventDefault()
      setSearchQuery(searchQuery + ghostCompletion)
      setShowSuggestions(false)
    }
    if (e.key === "Enter") handleSearch()
    if (e.key === "Escape") setShowSuggestions(false)
  }

  const handleSearch = () => {
    const query = searchQuery.trim()
    setShowSuggestions(false)
    setMobileMenuOpen(false)
    router.push(query ? `/productos?buscar=${encodeURIComponent(query)}` : "/productos")
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSearchQuery(suggestion.name)
    setShowSuggestions(false)
    setMobileMenuOpen(false)
    router.push(`/producto/${suggestion.id}`)
  }

  const SuggestionsDropdown = () => (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-elevated">
      {suggestions.map((s) => (
        <button
          key={s.id}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleSuggestionClick(s)}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-secondary cursor-pointer"
        >
          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
            <img src={s.image_url} alt={s.name} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
            <p className="text-xs text-primary">${s.price.toFixed(2)}</p>
          </div>
        </button>
      ))}
    </div>
  )

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 hidden md:block">
        <div className="navbar-solid shadow-soft">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href={user?.role === "seller" ? "/vendedor" : "/"} className="flex items-center cursor-pointer">
                <Image src="/icon.png" alt="techHub" width={64} height={64} className="h-14 w-auto" priority />
              </Link>

              <nav className="flex items-center gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 lg:flex">
                  <div ref={desktopSearchRef} className="relative w-64 xl:w-72">
                    <div className="relative w-full rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary/30">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      {ghostCompletion && (
                        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center overflow-hidden pl-9 pr-3">
                          <span className="whitespace-pre text-transparent text-sm">{searchQuery}</span>
                          <span className="whitespace-pre text-muted-foreground/50 text-sm">{ghostCompletion}</span>
                        </div>
                      )}
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
                        onKeyDown={acceptGhost}
                        placeholder="Buscar productos..."
                        className="relative w-full bg-transparent py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    {showSuggestions && suggestions.length > 0 && <SuggestionsDropdown />}
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-lg cursor-pointer" onClick={handleSearch}>
                    <Search className="h-5 w-5" />
                  </Button>
                </div>

                <Link href="/productos" className="lg:hidden">
                  <Button variant="ghost" size="icon" className="rounded-lg cursor-pointer">
                    <Search className="h-5 w-5" />
                  </Button>
                </Link>

                <Link href="/carrito">
                  <Button variant="ghost" size="icon" className="relative rounded-lg cursor-pointer">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {cartItemCount}
                      </span>
                    )}
                  </Button>
                </Link>

                {user ? (
                  <>
                    <Link href={user.role === "seller" ? "/vendedor" : "/perfil"}>
                      <Button variant="outline" className="ml-2 rounded-lg cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        {user.role === "seller" ? "Mi tienda" : "Mi perfil"}
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="rounded-lg cursor-pointer" onClick={() => void logout()}>
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <Link href="/iniciar-sesion">
                    <Button variant="outline" className="ml-2 rounded-lg cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Iniciar sesión
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <header className="fixed left-0 right-0 top-0 z-50 md:hidden">
        <div className="navbar-solid shadow-soft">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href={user?.role === "seller" ? "/vendedor" : "/"} className="flex items-center cursor-pointer">
              <Image src="/icon.png" alt="techHub" width={64} height={64} className="h-12 w-auto" priority />
            </Link>

            <div className="flex items-center gap-1">
              <Link href="/productos">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg cursor-pointer">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/carrito">
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg cursor-pointer">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg cursor-pointer"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "navbar-solid absolute left-0 right-0 top-14 overflow-hidden shadow-elevated transition-all duration-300",
            mobileMenuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav className="flex flex-col gap-1 p-4">
            <div ref={mobileSearchRef} className="relative mb-2">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-2 focus-within:ring-2 focus-within:ring-primary/30">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  {ghostCompletion && (
                    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center overflow-hidden pl-9 pr-3">
                      <span className="whitespace-pre text-transparent text-sm">{searchQuery}</span>
                      <span className="whitespace-pre text-muted-foreground/50 text-sm">{ghostCompletion}</span>
                    </div>
                  )}
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
                    onKeyDown={acceptGhost}
                    placeholder="Buscar productos..."
                    className="relative w-full bg-transparent py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <Button size="sm" className="rounded-lg" onClick={handleSearch}>
                  Buscar
                </Button>
              </div>
              {showSuggestions && suggestions.length > 0 && <SuggestionsDropdown />}
            </div>

            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}

            <div className="mt-2 space-y-2">
              {user ? (
                <>
                  <Link href={user.role === "seller" ? "/vendedor" : "/perfil"} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-lg cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      {user.role === "seller" ? "Mi tienda" : "Mi perfil"}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full rounded-lg cursor-pointer my-2"
                    onClick={async () => {
                      setMobileMenuOpen(false)
                      await logout()
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </Button>
                </>
              ) : (
                <Link href="/iniciar-sesion" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-lg cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Iniciar sesión
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      <div className="h-14 md:h-16" />
    </>
  )
}

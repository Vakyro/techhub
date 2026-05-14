"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  nombre: string
  telefono?: string
  role: "buyer" | "seller" | "admin"
  user_type: "usuario" | "vendedor" | "admin"
}

interface SessionContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => void
  theme: "light" | "dark"
  toggleTheme: () => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const saved = localStorage.getItem("techhub_theme") as "light" | "dark" | null
    const resolved = saved ?? "light"
    setTheme(resolved)
    document.documentElement.classList.toggle("dark", resolved === "dark")

    initializeSession()

    const handleStorageChange = () => {
      initializeSession()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("session-update", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("session-update", handleStorageChange)
    }
  }, [])

  const initializeSession = () => {
    try {
      const stored = localStorage.getItem("session")
      if (stored) {
        const userData = JSON.parse(stored)
        setUser(userData)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Error loading session:", error)
      localStorage.removeItem("session")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("session")
    document.cookie = "techhub_session=; path=/; max-age=0; samesite=lax"
    window.dispatchEvent(new Event("session-update"))
  }

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    localStorage.setItem("techhub_theme", next)
    document.documentElement.classList.toggle("dark", next === "dark")
  }

  return (
    <SessionContext.Provider value={{ user, isLoading, isAuthenticated, logout, theme, toggleTheme }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within SessionProvider")
  }
  return context
}

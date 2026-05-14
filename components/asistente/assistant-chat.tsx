"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, Package, Puzzle, RefreshCw, Send, Sparkles, X, Zap, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SmartInput } from "@/components/ui/smart-input"
import { CameraCapture } from "@/components/ui/camera-capture"
import { ProductRecommendationCard, type ChatProduct } from "@/components/asistente/product-recommendation-card"

const suggestedPrompts = [
  { icon: Puzzle, text: "Necesito armar un robot seguidor de línea para la escuela" },
  { icon: Zap, text: "Quiero automatizar el riego de mi jardín con IoT" },
  { icon: GraduationCap, text: "Busco un kit para aprender electrónica básica" },
  { icon: Package, text: "Necesito componentes para una estación meteorológica" },
]

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  products?: ChatProduct[]
  timestamp: Date
}

function stripIdsFromAssistantText(input: string): string {
  return input
    .replace(/\(\s*id\s*:\s*[a-f0-9\-]{36}\s*\)/gi, "")
    .replace(/\[\s*id\s*:\s*[a-f0-9\-]{36}\s*\]/gi, "")
    .replace(/\b(id|uuid)\s*:\s*[a-f0-9\-]{36}\b/gi, "")
    .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
}

function MessageBubble({ message }: { message: Message }) {
  if (message.type === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-xl rounded-br-lg bg-primary px-5 py-3 text-primary-foreground">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 space-y-3 text-left">
        <div className="max-w-[90%] rounded-xl rounded-tl-lg bg-card px-5 py-3 shadow-soft">
          <p className="text-sm leading-relaxed text-foreground">{message.content}</p>
        </div>
        {message.products && message.products.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {message.products.map((product) => (
              <ProductRecommendationCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

type AssistantChatProps = {
  showIntro?: boolean
}

export function AssistantChat({ showIntro = true }: AssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = messagesContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isTyping])

  const handleSubmit = async (prompt: string) => {
    const imageData = capturedImage
    const trimmedPrompt = prompt.trim()

    if ((!trimmedPrompt && !imageData) || isTyping) return

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "user",
        content: imageData ? `${trimmedPrompt || "Imagen adjunta"} (con imagen)` : trimmedPrompt,
        timestamp: new Date(),
      },
    ])
    setInputValue("")
    setCapturedImage(null)
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedPrompt, ...(imageData ? { imageData } : {}) }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Error desconocido")

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: stripIdsFromAssistantText(data.response ?? ""),
          products: data.products,
          timestamp: new Date(),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "No pude procesar tu solicitud ahora mismo. Cuéntame tu presupuesto, categoría y tipo de proyecto para ayudarte mejor.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handlePhotoSend = (imageData: string) => {
    setCapturedImage(imageData)
    setCameraOpen(false)
  }

  return (
    <div className="flex min-h-0 flex-col">
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-12">
          {showIntro && (
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 shadow-soft">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">Asistente de compras IA</h1>
            </div>
          )}

          <div className="mb-8 w-full max-w-2xl">
            {cameraOpen ? (
              <CameraCapture onClose={() => setCameraOpen(false)} onSend={handlePhotoSend} />
            ) : (
              <div className="space-y-3 rounded-lg bg-card/80 px-4 py-3">
                {capturedImage && (
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-3 text-left">
                    <img src={capturedImage} alt="Foto adjunta" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">Foto adjunta</p>
                      <p className="text-xs text-muted-foreground">Se conserva para usarla en la búsqueda visual.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCapturedImage(null)}
                      className="cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                      aria-label="Quitar foto"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(inputValue) }} className="flex items-center gap-3">
                  <SmartInput
                    value={inputValue}
                    onValueChange={setInputValue}
                    onSubmit={() => handleSubmit(inputValue)}
                    onCameraClick={() => setCameraOpen(true)}
                    placeholder="Describe lo que quieres construir..."
                    leftIcon={<Sparkles className="h-5 w-5 text-primary" />}
                    wrapperClassName="flex-1 min-w-0"
                    inputClassName="h-12 rounded-xl border-border bg-background text-base shadow-none"
                  />
                  <Button
                    type="submit"
                    className="rounded-xl bg-primary px-5 hover:bg-primary/90"
                    disabled={(!inputValue.trim() && !capturedImage) || isTyping}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </div>

          <div className="w-full max-w-2xl">
            <p className="mb-4 text-center text-sm font-medium text-muted-foreground">Prueba con estos ejemplos</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="group flex items-center gap-3 rounded-lg bg-card p-4 text-left shadow-soft transition-lift"
                  onClick={() => handleSubmit(prompt.text)}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                    <prompt.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm text-foreground">{prompt.text}</span>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 flex-col">
          <div ref={messagesContainerRef} className="flex-1 min-h-0 space-y-6 overflow-y-auto py-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-5 w-5 animate-pulse-soft text-primary" />
                </div>
                <div className="max-w-[90%] rounded-xl rounded-tl-lg bg-card px-5 py-3 shadow-soft">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Buscando productos...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-t from-background via-background to-transparent pb-6 pt-4">
            <div className="space-y-3 rounded-lg bg-card/80 px-4 py-3">
              {capturedImage && (
                <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-3 text-left">
                  <img src={capturedImage} alt="Foto adjunta" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">Foto adjunta</p>
                    <p className="text-xs text-muted-foreground">Se conserva para usarla en la búsqueda visual.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCapturedImage(null)}
                    className="cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    aria-label="Quitar foto"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {cameraOpen ? (
                <CameraCapture onClose={() => setCameraOpen(false)} onSend={handlePhotoSend} />
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(inputValue) }} className="flex items-center gap-3">
                  <SmartInput
                    value={inputValue}
                    onValueChange={setInputValue}
                    onSubmit={() => handleSubmit(inputValue)}
                    onCameraClick={() => setCameraOpen(true)}
                    placeholder="Escribe un mensaje..."
                    leftIcon={<Sparkles className="h-5 w-5 text-primary" />}
                    wrapperClassName="flex-1 min-w-0"
                    inputClassName="h-11 rounded-xl border-border bg-background text-base shadow-none"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90"
                    disabled={(!inputValue.trim() && !capturedImage) || isTyping}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

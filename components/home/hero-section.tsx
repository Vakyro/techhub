import Link from "next/link"
import { ArrowRight, Package, Play, Sparkles, Truck, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AssistantChat } from "@/components/asistente/assistant-chat"

const features = [
  {
    icon: Package,
    title: "Mayoreo activo",
    description: "Precios especiales desde 10 piezas",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: TrendingUp,
    title: "Prediccion IA",
    description: "Recomendaciones inteligentes",
    color: "bg-accent/30 text-accent-foreground",
  },
  {
    icon: Truck,
    title: "Entrega local",
    description: "Mismo dia en Tijuana",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    icon: Play,
    title: "TechReels",
    description: "Videos de productos",
    color: "bg-[#84bcbf]/20 text-foreground",
  },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-secondary/30 md:min-h-[90vh]">
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Tecnologia, componentes y electronica para{" "}
            <span className="text-primary">makers de Tijuana</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
            Compra hardware, kits, refacciones y accesorios tech con recomendaciones inteligentes.
          </p>

          <div className="mx-auto mb-8 max-w-2xl">
            <AssistantChat showIntro={false} />
          </div>

          <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/productos">
              <Button
                size="lg"
                className="w-full rounded-xl bg-primary px-8 py-6 text-base font-medium hover:bg-primary/90 sm:w-auto cursor-pointer"
              >
                Explorar productos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/asistente">
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-xl border-2 border-primary/20 bg-card px-8 py-6 text-base font-medium hover:bg-primary/10 sm:w-auto cursor-pointer"
              >
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                Chat completo
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-5 shadow-soft transition-lift cursor-pointer"
              >
                <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg ${feature.color}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

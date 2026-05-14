import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AssistantChat } from "@/components/asistente/assistant-chat"

export default function AssistantPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col pb-8 pt-20 md:pt-24">
        <div className="mx-auto flex w-full max-w-4xl flex-1 min-h-0 flex-col px-4 sm:px-6">
          <AssistantChat />
        </div>
      </main>
      <Footer />
    </div>
  )
}

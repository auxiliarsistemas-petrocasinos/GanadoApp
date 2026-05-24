import { HardHat } from "lucide-react"

export default function ChatBotPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#FFF0E6] text-secondary mb-6">
        <HardHat className="h-14 w-14" strokeWidth={2.5} />
      </div>
      <h2 className="text-[36px] font-black italic text-[#243043] uppercase tracking-tight mb-4">
        MÓDULO EN CONSTRUCCIÓN
      </h2>
      <p className="max-w-[500px] text-[#6b7280] text-[16px] leading-relaxed font-light">
        Estamos trabajando para brindarte la mejor experiencia. Esta<br />funcionalidad estará disponible muy pronto.
      </p>
      <div className="mt-10 flex gap-3">
        <div className="h-3 w-3 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="h-3 w-3 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="h-3 w-3 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  )
}

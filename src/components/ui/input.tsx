import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-[46px] w-full min-w-0 rounded-xl bg-[#F8FAFC] px-4 py-2 text-[15px] font-medium text-slate-800 transition-all outline-none placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:shadow-[0_0_15px_rgba(255,106,35,0.1)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }

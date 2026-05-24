import * as React from "react"
import { cn } from "@/lib/utils"

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
}

export function FormSection({ title, children, className, ...props }: FormSectionProps) {
  return (
    <div className={cn("mt-6 space-y-4", className)} {...props}>
      <h3 className="text-[11px] font-black text-[#64748B] uppercase tracking-[0.1em] border-t border-slate-100 pt-6">
        {title}
      </h3>
      <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-50 shadow-sm">
        {children}
      </div>
    </div>
  )
}

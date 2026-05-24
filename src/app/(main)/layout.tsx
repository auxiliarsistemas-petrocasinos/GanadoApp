'use client'

import { Sidebar } from "@/components/layout/Sidebar"
import { Search, Moon, Bell } from "lucide-react"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden bg-[#F8F9FA]">
        <header className="flex h-20 items-center justify-between bg-white px-8 shadow-sm z-10">
          <div className="flex w-full max-w-md items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-muted-foreground focus-within:ring-1 focus-within:ring-secondary/50 transition-shadow">
            <Search className="h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-6 text-gray-400">
            <button className="hover:text-primary transition-colors">
              <Moon className="h-5 w-5" />
            </button>
            <button className="relative hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 flex h-2 w-2 rounded-full bg-destructive"></span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Egg, Beef, Fish, Bot, LogOut, ChevronLeft, ChevronRight, ChevronDown, Layers, ClipboardList } from "lucide-react"
import { createClient } from "@/lib/supabase"

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  {
    name: 'Gallinas',
    href: '/lotes',
    icon: Egg,
    subItems: [
      { name: 'Lotes', href: '/lotes', icon: Layers },
      { name: 'Registros Diarios', href: '/lotes/registros', icon: ClipboardList },
    ],
  },
  {
    name: 'Vacas',
    href: '/vacas',
    icon: Beef,
    subItems: [
      { name: 'Ganado', href: '/vacas/ganado', icon: Layers },
      { name: 'Registros Diarios', href: '/vacas/registros', icon: ClipboardList },
    ],
  },
  {
    name: 'Peces',
    href: '/peces',
    icon: Fish,
    subItems: [
      { name: 'Estanques', href: '/peces/estanques', icon: Layers },
      { name: 'Registros Diarios', href: '/peces/registros', icon: ClipboardList },
    ],
  },
  { name: 'ChatBot', href: '/chatbot', icon: Bot },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className={`relative flex h-full flex-col bg-primary text-primary-foreground shadow-lg transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-white shadow-md hover:bg-secondary/90 transition-colors"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Logo */}
      <div className={`flex h-20 items-center ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
        <h1 className="text-2xl font-extrabold tracking-tight">
          {isCollapsed ? (
            <><span className="text-white">G</span><span className="text-secondary">A</span></>
          ) : (
            <><span className="text-white">Ganado</span><span className="text-secondary">App</span></>
          )}
        </h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-1 px-3 font-medium">
          {menuItems.map((item) => {
            // Item con sub-menú
            if (item.subItems) {
              const parentActive = pathname.startsWith(item.href)
              
              // Determine active sub-item using longest prefix match
              const activeSub = item.subItems
                .filter(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'))
                .reduce((prev, curr) => curr.href.length > prev.href.length ? curr : prev, { href: '' } as any)

              return (
                <div key={item.name}>
                  {/* Parent row — navega al módulo principal */}
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-lg transition-colors hover:bg-white/5 cursor-pointer ${
                      isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
                    } ${parentActive ? 'text-secondary' : 'text-white/70'}`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 ${parentActive ? 'text-secondary' : 'text-white/70'}`} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-sm">{item.name}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${parentActive ? 'rotate-0' : '-rotate-90'}`} />
                      </>
                    )}
                  </Link>

                  {/* Sub-items — visibles cuando no está colapsado y el padre está activo */}
                  {!isCollapsed && parentActive && (
                    <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/10 pl-3">
                      {item.subItems.map((sub) => {
                        const subActive = sub.href === activeSub.href
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                              subActive
                                ? 'bg-secondary text-white font-semibold'
                                : 'text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <sub.icon className="h-4 w-4 shrink-0" />
                            {sub.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}

                  {/* En modo colapsado, muestra sólo el ícono del padre */}
                  {isCollapsed && parentActive && (
                    <div className="mt-1 flex flex-col gap-1 items-center">
                      {item.subItems.map((sub) => {
                        const subActive = sub.href === activeSub.href
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            title={sub.name}
                            className={`flex items-center justify-center rounded-lg p-2 transition-colors ${
                              subActive ? 'bg-secondary text-white' : 'text-white/60 hover:bg-white/10'
                            }`}
                          >
                            <sub.icon className="h-4 w-4" />
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Item sin sub-menú (resto)
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center rounded-lg transition-colors ${
                  isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
                } ${active ? 'bg-secondary text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-white/70'}`} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User + Logout */}
      <div className="border-t border-white/10 p-4">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-2'} py-2`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-white text-sm">
            MA
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold text-white">manuel.amado</span>
              <span className="text-xs text-white/60">Admin</span>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
          className={`mt-2 flex w-full items-center rounded-lg transition-colors text-white/70 hover:bg-white/10 hover:text-white ${
            isCollapsed ? 'justify-center p-3' : 'gap-2 px-4 py-2 text-sm'
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>CERRAR SESIÓN</span>}
        </button>
      </div>
    </div>
  )
}

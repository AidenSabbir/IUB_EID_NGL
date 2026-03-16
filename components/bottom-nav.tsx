"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Mail, User, Moon } from "lucide-react"
import { useUnreadCount } from "@/hooks/use-unread-count"

export function BottomNav() {
  const pathname = usePathname()
  const { unreadCount } = useUnreadCount()

  const tabs = [
    {
      name: "Inbox",
      href: "/inbox",
      icon: Mail,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
  ]

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 border-r border-border min-h-full bg-card p-4">
        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = pathname.startsWith(tab.href)
            const isInbox = tab.name === "Inbox"
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-lg">{tab.name}</span>
                {isInbox && unreadCount > 0 && (
                  <span className="absolute top-2 right-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 pb-safe z-50 shadow-md">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname.startsWith(tab.href)
          const isInbox = tab.name === "Inbox"
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"
                }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? "fill-primary/20" : ""}`} />
                {isInbox && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-5 h-5 px-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? "font-medium" : ""}`}>
                {tab.name}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Shield,
  LayoutDashboard,
  Route,
  Clock,
  Settings,
  Users,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { ActiveJourneyCard } from "@/components/journey/active-journey-card"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/routes", icon: Route, label: "Routes" },
  { href: "/contacts", icon: Users, label: "Contacts" },
  { href: "/history", icon: Clock, label: "History" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-surface">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-on" />
              </div>
              <span className="text-lg font-medium text-surface-on hidden sm:block">
                BeSafe
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ease-material ${
                      isActive
                        ? "bg-secondary-container text-secondary-on-container font-medium"
                        : "text-surface-on-variant hover:bg-surface-container-highest"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-3">
              <span className="text-sm text-surface-on-variant hidden sm:block">
                {profile?.full_name || "User"}
              </span>
              <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ActiveJourneyCard />
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container border-t border-outline-variant/50 md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center min-w-[64px] min-h-[44px] relative"
              >
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavPill"
                      className="absolute inset-x-[-12px] inset-y-[-4px] bg-secondary-container rounded-full"
                      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
                    />
                  )}
                  <item.icon
                    className={`relative z-10 w-5 h-5 ${
                      isActive ? "text-secondary-on-container" : "text-surface-on-variant"
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] mt-1 ${
                    isActive
                      ? "text-secondary-on-container font-medium"
                      : "text-surface-on-variant"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

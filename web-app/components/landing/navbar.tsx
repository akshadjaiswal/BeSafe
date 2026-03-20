"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-on" />
            </div>
            <span className="text-xl font-medium text-surface-on">BeSafe</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="#how-it-works">How It Works</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="#features">Features</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-surface-container-highest transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            className="md:hidden border-t border-outline-variant/50 bg-surface/95 backdrop-blur-lg"
          >
            <div className="px-4 py-4 space-y-2">
              <Link
                href="#how-it-works"
                className="block px-4 py-3 rounded-2xl text-surface-on-variant hover:bg-surface-container-highest transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="#features"
                className="block px-4 py-3 rounded-2xl text-surface-on-variant hover:bg-surface-container-highest transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <div className="pt-2 flex flex-col gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/auth/login">Log In</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/auth/signup">Get Started Free</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

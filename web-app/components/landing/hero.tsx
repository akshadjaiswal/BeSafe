"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { staggerContainer, staggerItem } from "@/lib/motion"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary-container/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-secondary-container/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-tertiary-container/20 blur-3xl" />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Badge */}
        <motion.div variants={staggerItem} className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container/60 text-primary-on-container text-sm font-medium backdrop-blur-sm">
            <MapPin className="w-4 h-4" />
            Smart Location-Based Safety
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={staggerItem}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-surface-on mb-6"
        >
          Never Forget to Say{" "}
          <span className="text-gradient-primary">
            You&apos;re Safe
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={staggerItem}
          className="text-lg sm:text-xl text-surface-on-variant max-w-2xl mx-auto mb-10"
        >
          Automatic notifications when you reach your destination. No manual texting, no battery drain, just peace of mind for you and your loved ones.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={staggerItem}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button size="xl" className="w-full sm:w-auto" asChild>
            <Link href="/auth/signup">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-1" />
            </Link>
          </Button>
          <Button variant="outline" size="xl" className="w-full sm:w-auto" asChild>
            <Link href="#how-it-works">How It Works</Link>
          </Button>
        </motion.div>

        {/* Trust indicator */}
        <motion.p
          variants={staggerItem}
          className="mt-8 text-sm text-surface-on-variant/70"
        >
          Free to use &bull; No credit card required &bull; Privacy-first
        </motion.p>
      </motion.div>
    </section>
  )
}

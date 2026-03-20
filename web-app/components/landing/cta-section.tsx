"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { staggerContainer, staggerItem } from "@/lib/motion"

export function CtaSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative rounded-[2rem] bg-primary overflow-hidden p-12 sm:p-16 text-center"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-[250px] h-[250px] rounded-full bg-white/5 blur-2xl" />
          </div>

          <div className="relative z-10">
            <motion.h2
              variants={staggerItem}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-on mb-4"
            >
              Start Your Safe Commute Today
            </motion.h2>
            <motion.p
              variants={staggerItem}
              className="text-primary-on/80 text-lg max-w-xl mx-auto mb-8"
            >
              Set up in 2 minutes. Your loved ones will thank you.
            </motion.p>
            <motion.div variants={staggerItem}>
              <Button
                size="xl"
                className="bg-white text-primary hover:bg-white/90 hover:shadow-elevation-2"
                asChild
              >
                <Link href="/auth/signup">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

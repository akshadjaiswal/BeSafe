"use client"

import { motion } from "framer-motion"
import { MapPin, Navigation, Bell } from "lucide-react"
import { staggerContainer, staggerItem } from "@/lib/motion"

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Set Your Route",
    description:
      "Define your daily commute — just tap Home and Office on the map. Set which days it's active and who to notify.",
  },
  {
    number: "02",
    icon: Navigation,
    title: "Commute Normally",
    description:
      "BeSafe detects when you leave home and quietly tracks your journey. No manual start needed — completely hands-free.",
  },
  {
    number: "03",
    icon: Bell,
    title: "Loved Ones Notified",
    description:
      'When you arrive safely, your contacts instantly get a message: "Reached Office safely at 9:28 AM." Done.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.p
            variants={staggerItem}
            className="text-sm font-medium text-primary uppercase tracking-widest mb-3"
          >
            How It Works
          </motion.p>
          <motion.h2
            variants={staggerItem}
            className="text-3xl sm:text-4xl font-bold text-surface-on"
          >
            Safety in 3 Simple Steps
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={staggerItem}
              className="relative bg-surface rounded-3xl p-8 shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-300 ease-material"
            >
              {/* Step number */}
              <span className="text-6xl font-bold text-primary-container">
                {step.number}
              </span>

              {/* Icon */}
              <div className="mt-4 mb-4 w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center">
                <step.icon className="w-6 h-6 text-primary-on-container" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-medium text-surface-on mb-2">
                {step.title}
              </h3>
              <p className="text-surface-on-variant leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

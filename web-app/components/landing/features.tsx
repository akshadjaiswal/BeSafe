"use client"

import { motion } from "framer-motion"
import {
  Radar,
  BatteryCharging,
  ShieldCheck,
  Clock,
  Users,
  Smartphone,
} from "lucide-react"
import { staggerContainer, staggerItem } from "@/lib/motion"

const features = [
  {
    icon: Radar,
    title: "Smart Detection",
    description:
      "Intelligent geofencing detects when you leave and arrive — no manual action required.",
    color: "bg-primary-container",
    iconColor: "text-primary-on-container",
  },
  {
    icon: BatteryCharging,
    title: "Battery Efficient",
    description:
      "Event-driven tracking uses less than 5% battery per hour. Only active during your commute.",
    color: "bg-secondary-container",
    iconColor: "text-secondary-on-container",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description:
      "No 24/7 GPS tracking. Location data is only collected during active journeys and never stored permanently.",
    color: "bg-tertiary-container",
    iconColor: "text-tertiary-on-container",
  },
  {
    icon: Clock,
    title: "Delay Alerts",
    description:
      "If you don't arrive on time, your emergency contacts get an alert with your last known location.",
    color: "bg-error-container",
    iconColor: "text-error-on-container",
  },
  {
    icon: Users,
    title: "Multiple Contacts",
    description:
      "Assign different contacts to different routes. Mom gets notified for home, partner for office.",
    color: "bg-primary-container",
    iconColor: "text-primary-on-container",
  },
  {
    icon: Smartphone,
    title: "Works Everywhere",
    description:
      "Progressive Web App works on any device. Install it like an app without the app store.",
    color: "bg-secondary-container",
    iconColor: "text-secondary-on-container",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24">
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
            Features
          </motion.p>
          <motion.h2
            variants={staggerItem}
            className="text-3xl sm:text-4xl font-bold text-surface-on"
          >
            Everything You Need, Nothing You Don&apos;t
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              className="group rounded-3xl bg-surface-container p-6 hover:shadow-elevation-1 transition-all duration-300 ease-material"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}
              >
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>
              <h3 className="text-lg font-medium text-surface-on mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-surface-on-variant leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

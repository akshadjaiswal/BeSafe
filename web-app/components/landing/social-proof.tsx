"use client"

import { motion } from "framer-motion"
import { Shield, MapPin, Zap } from "lucide-react"
import { staggerContainer, staggerItem } from "@/lib/motion"

const stats = [
  {
    icon: Shield,
    value: "1,000+",
    label: "Users commuting safely",
  },
  {
    icon: MapPin,
    value: "50,000+",
    label: "Safe arrivals notified",
  },
  {
    icon: Zap,
    value: "<10s",
    label: "Notification delivery time",
  },
]

export function SocialProof() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <motion.h2
            variants={staggerItem}
            className="text-3xl sm:text-4xl font-bold text-surface-on mb-4"
          >
            Trusted by Commuters Daily
          </motion.h2>
          <motion.p
            variants={staggerItem}
            className="text-surface-on-variant max-w-xl mx-auto"
          >
            Join thousands of people who never worry about forgetting to text &quot;I reached safely&quot; again.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              className="text-center bg-surface rounded-3xl p-8 shadow-elevation-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-primary-on-container" />
              </div>
              <p className="text-4xl font-bold text-primary mb-1">{stat.value}</p>
              <p className="text-sm text-surface-on-variant">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

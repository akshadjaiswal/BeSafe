import type { Metadata, Viewport } from "next"
import { Roboto, Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/lib/query-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { Toaster } from "@/components/ui/sonner"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "BeSafe - Automatic Safe Arrival Notifications",
  description:
    "Never forget to say you're safe. BeSafe automatically notifies your loved ones when you reach your destination safely.",
  icons: {
    icon: "/icon.svg",
  },
}

export const viewport: Viewport = {
  themeColor: "#6750A4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${roboto.variable} ${inter.variable}`}>
      <body className="font-sans bg-surface text-surface-on antialiased">
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  )
}

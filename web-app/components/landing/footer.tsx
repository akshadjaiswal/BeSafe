import Link from "next/link"
import { Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-outline-variant/50 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-on" />
              </div>
              <span className="text-xl font-medium text-surface-on">BeSafe</span>
            </Link>
            <p className="text-sm text-surface-on-variant max-w-sm leading-relaxed">
              Automatic safe arrival notifications for daily commuters. Privacy-first, battery-efficient, and completely hands-free.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-medium text-surface-on mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#how-it-works" className="text-sm text-surface-on-variant hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-sm text-surface-on-variant hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-sm text-surface-on-variant hover:text-primary transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-surface-on mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-surface-on-variant hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-surface-on-variant hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-surface-on-variant hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-outline-variant/50 text-center">
          <p className="text-sm text-surface-on-variant">
            &copy; {new Date().getFullYear()} BeSafe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

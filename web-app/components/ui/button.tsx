import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 ease-material focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 min-h-[44px]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-on rounded-full hover:shadow-elevation-1",
        tonal:
          "bg-secondary-container text-secondary-on-container rounded-full hover:shadow-elevation-1",
        outline:
          "border border-outline bg-transparent text-primary rounded-full hover:bg-primary/8",
        text: "text-primary rounded-full hover:bg-primary/8",
        destructive:
          "bg-error text-error-on rounded-full hover:shadow-elevation-1",
        elevated:
          "bg-surface-container-low text-primary shadow-elevation-1 rounded-full hover:shadow-elevation-2",
        ghost: "text-surface-on-variant rounded-full hover:bg-surface-container-highest",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

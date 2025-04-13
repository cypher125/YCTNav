import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--yabatech-green)] text-white shadow hover:bg-[var(--yabatech-dark-green)] transition-all duration-200",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700",
        outline:
          "border border-[var(--yabatech-green)] text-[var(--yabatech-green)] bg-transparent shadow-sm hover:bg-[var(--yabatech-green)]/10",
        secondary:
          "bg-[var(--yabatech-light-green)] text-white shadow-sm hover:bg-[var(--yabatech-green)]/80",
        accent:
          "bg-[var(--yabatech-accent)] text-[var(--yabatech-dark-green)] font-medium shadow-sm hover:brightness-95",
        ghost: "hover:bg-[var(--yabatech-green)]/10 hover:text-[var(--yabatech-green)]",
        link: "text-[var(--yabatech-green)] underline-offset-4 hover:underline",
        white: "bg-white text-[var(--yabatech-green)] shadow hover:bg-white/90",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none",
      },
      shadow: {
        default: "shadow",
        lg: "shadow-lg hover:shadow-xl",
        none: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
      shadow: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, shadow, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, shadow, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

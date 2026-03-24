import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-button text-white shadow-glow-button hover:shadow-glow-primary hover:brightness-110 active:scale-95',
        secondary:
          'bg-surface text-text-primary border border-border hover:bg-surface-hover hover:border-border-bright active:scale-95',
        ghost:
          'text-text-secondary hover:text-text-primary hover:bg-surface active:scale-95',
        destructive:
          'bg-error/10 text-error border border-error/20 hover:bg-error/20 active:scale-95',
        outline:
          'border border-border text-text-primary hover:bg-surface hover:border-border-bright active:scale-95',
        glow:
          'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 shadow-glow-primary active:scale-95',
        link:
          'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        default: 'h-9 px-4 text-sm rounded-lg',
        lg: 'h-11 px-6 text-sm rounded-xl',
        xl: 'h-13 px-8 text-base rounded-xl py-4',
        icon: 'h-9 w-9 rounded-lg',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

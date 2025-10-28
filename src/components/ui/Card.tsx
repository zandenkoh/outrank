import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

const cardVariants = cva(
  'rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-card)] border transition-shadow duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-[var(--color-surface-dark)] border-gray-200 dark:border-gray-700',
        highlight: 'bg-primary/5 dark:bg-primary/10 border-primary/20',
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
)
Card.displayName = 'Card'

export { Card, cardVariants }

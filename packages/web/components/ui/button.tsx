'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-brand-ink hover:opacity-90 border border-brand',
        secondary: 'bg-surface-2 text-ink border border-line hover:bg-surface',
        danger: 'bg-surface text-ink border border-line-strong hover:bg-surface-2',
        ghost: 'text-ink-2 hover:bg-surface-2',
      },
      size: {
        sm: 'h-7 px-2.5',
        md: 'h-8 px-3.5',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';

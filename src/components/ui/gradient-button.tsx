import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';
import { forwardRef } from 'react';

interface GradientButtonProps extends ButtonProps {
  glow?: boolean;
}

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, glow = false, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          'bg-gradient-to-r from-cosmic-magenta to-cosmic-violet text-white border-0',
          'hover:from-cosmic-magenta/90 hover:to-cosmic-violet/90',
          'transition-all duration-300',
          glow && 'glow-primary animate-pulse-glow',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

GradientButton.displayName = 'GradientButton';

export { GradientButton };

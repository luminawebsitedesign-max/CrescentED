import { cn } from '@/lib/utils';

interface CosmicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'gradient';
  hover?: boolean;
}

const CosmicCard = ({
  children,
  className,
  variant = 'default',
  hover = true,
  ...props
}: CosmicCardProps) => {
  return (
    <div
      className={cn(
        'glass-cosmic rounded-xl',
        hover && 'hover-lift cursor-pointer',
        variant === 'glow' && 'glow-primary',
        variant === 'gradient' && 'bg-gradient-to-br from-cosmic-plum/20 to-cosmic-violet/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { CosmicCard };

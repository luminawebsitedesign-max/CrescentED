import { cn } from '@/lib/utils';

interface SectionDividerProps {
  className?: string;
  label?: string;
}

const SectionDivider = ({ className, label }: SectionDividerProps) => {
  return (
    <div className={cn('relative py-6', className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gradient-to-r from-transparent via-border to-transparent" />
      </div>
      {label && (
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-4 text-muted-foreground tracking-wider">
            {label}
          </span>
        </div>
      )}
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-cosmic-magenta/30 to-transparent" />
    </div>
  );
};

export { SectionDivider };

import { cn } from '@/lib/utils';

interface CrescentLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  glow?: boolean;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const iconSizeMap = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const CrescentLogo = ({ size = 'md', className, glow = false }: CrescentLogoProps) => {
  return (
    <div
      className={cn(
        'rounded-xl bg-gradient-to-br from-cosmic-magenta via-cosmic-rose to-cosmic-violet flex items-center justify-center',
        sizeMap[size],
        glow && 'animate-pulse-glow',
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn('text-white', iconSizeMap[size])}
      >
        {/* Crescent moon shape */}
        <defs>
          <linearGradient id="crescentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,1)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.7)" />
          </linearGradient>
        </defs>
        <path
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          fill="url(#crescentGradient)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />
        {/* Subtle star accents */}
        <circle cx="7" cy="7" r="0.5" fill="rgba(255,255,255,0.6)" />
        <circle cx="9" cy="5" r="0.3" fill="rgba(255,255,255,0.4)" />
        <circle cx="5" cy="9" r="0.3" fill="rgba(255,255,255,0.4)" />
      </svg>
    </div>
  );
};

export default CrescentLogo;

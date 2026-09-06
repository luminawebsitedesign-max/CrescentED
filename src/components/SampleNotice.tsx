import { Sparkles } from 'lucide-react';
import { DEMO_MODE, REPO_URL, SAMPLE_OUTPUT_NOTICE } from '@/lib/demo';
import { cn } from '@/lib/utils';

interface SampleNoticeProps {
  className?: string;
}

/**
 * Label attached to any AI-shaped output while demo mode is on.
 * Renders nothing when demo mode is off.
 */
const SampleNotice = ({ className }: SampleNoticeProps) => {
  if (!DEMO_MODE) return null;

  return (
    <p
      className={cn(
        'flex items-start gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground',
        className
      )}
    >
      <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" aria-hidden="true" />
      <span>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-2"
        >
          {SAMPLE_OUTPUT_NOTICE}
        </a>
      </span>
    </p>
  );
};

export default SampleNotice;

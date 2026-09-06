import { useState } from 'react';
import { X, Info } from 'lucide-react';
import { DEMO_MODE, REPO_URL } from '@/lib/demo';
import { demoStorage } from '@/lib/demoStorage';

/** Dismissible notice shown in demo mode. Nothing renders when demo mode is off. */
const DemoBanner = () => {
  const [hidden, setHidden] = useState(() => !DEMO_MODE || demoStorage.isBannerDismissed());

  if (hidden) return null;

  return (
    <div className="relative z-20 mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 pr-10">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-foreground/90">
          This is a live demo. Your answers are stored in this browser only — nothing is saved to a
          server, and the course and mentor replies are bundled samples.{' '}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline underline-offset-2"
          >
            View the repo
          </a>{' '}
          to run it with your own keys.
        </p>
      </div>
      <button
        type="button"
        aria-label="Dismiss demo notice"
        onClick={() => {
          demoStorage.dismissBanner();
          setHidden(true);
        }}
        className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default DemoBanner;

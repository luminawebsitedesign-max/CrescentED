/**
 * Demo mode flag.
 *
 * Env var: VITE_DEMO_MODE
 *   "true"  -> demo mode ON  (zero backend calls, zero AI calls)
 *   "false" -> demo mode OFF (real Supabase + AI path, unchanged)
 *
 * When the variable is not set at all we fall back to `import.meta.env.PROD`,
 * so a deployed/production build defaults to demo mode while `vite dev`
 * (local development for anyone who clones the repo) defaults to the real path.
 */
const raw = import.meta.env.VITE_DEMO_MODE as string | undefined;

export const DEMO_MODE: boolean =
  raw === undefined || raw === ''
    ? Boolean(import.meta.env.PROD)
    : String(raw).toLowerCase() === 'true';

export const REPO_URL = 'https://github.com/luminawebsitedesign-max/crescented';

export const SAMPLE_OUTPUT_NOTICE =
  'Sample output — demo mode. Clone the repo and add your own API key to generate a real course.';

/** Fake identity used only in demo mode so UI that expects a user still renders. */
export const DEMO_USER_ID = 'demo-local-user';
export const DEMO_USER_EMAIL = 'you@demo.local';

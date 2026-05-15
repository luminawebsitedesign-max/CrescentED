import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CrescentLogo from '@/components/ui/crescent-logo';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <main className="min-h-screen bg-background noise-texture flex items-center justify-center p-6">
      <div className="fixed inset-0 aurora-overlay pointer-events-none" />
      <div className="relative z-10 text-center max-w-md">
        <CrescentLogo size="xl" className="mx-auto mb-6" glow />
        <h1 className="font-sora text-6xl font-bold text-gradient-cosmic mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          This page doesn't exist. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard">
            <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2 w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;

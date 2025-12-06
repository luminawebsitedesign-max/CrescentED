import DashboardLayout from '@/components/Layout/DashboardLayout';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { Briefcase, FileText, Palette, FolderOpen, Clock } from 'lucide-react';

const BusinessHub = () => {
  return (
    <DashboardLayout loading={false}>
      <div className="max-w-3xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-magenta to-cosmic-violet flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-sora text-3xl font-bold mb-3">Business Hub</h1>
          <p className="text-muted-foreground text-lg">Coming Soon</p>
        </div>

        <CosmicCard className="p-8" hover={false}>
          <div className="text-center mb-8">
            <Clock className="w-12 h-12 text-primary mx-auto mb-4 opacity-60" />
            <p className="text-muted-foreground max-w-lg mx-auto">
              This will be your central command center for everything related to your business. 
              Complete your course modules to unlock this feature.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Saved PDFs & Documents</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                All your worksheets, templates, and exports in one place.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Branding Assets</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Store your logo, colors, fonts, and brand guidelines.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Business Overview</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                A complete snapshot of your business plan and progress.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Templates Library</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Quick access to all plug-and-plays you've generated.
              </p>
            </div>
          </div>
        </CosmicCard>
      </div>
    </DashboardLayout>
  );
};

export default BusinessHub;

import { useState, useEffect } from 'react';
import { getSession, getProfile, saveProfile } from '@/lib/api';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useStore();
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    full_name: '',
    experience_level: 'beginner',
    learning_style: 'mixed',
    time_commitment: 'moderate',
  });

  useEffect(() => {
    const loadProfile = async () => {
      const session = await getSession();
      if (!session) return;

      const data = await getProfile(session.user.id);

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          experience_level: data.experience_level || 'beginner',
          learning_style: data.learning_style || 'mixed',
          time_commitment: data.time_commitment || 'moderate',
        });
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    const session = await getSession();
    if (!session) return;
    setSaving(true);

    try {
      await saveProfile(session.user.id, profile);
      toast({ title: 'Profile updated!', description: 'Your changes have been saved.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save profile', variant: 'destructive' });
    }
    setSaving(false);
  };

  const radioOption = (value: string, label: string, desc: string, selected: boolean) => (
    <label
      key={value}
      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
        selected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
      }`}
    >
      <RadioGroupItem value={value} className="mt-0.5" />
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </label>
  );

  return (
    <DashboardLayout loading={loading}>
      <div className="max-w-2xl mx-auto animate-fade-in pb-8">
        <div className="mb-6">
          <h1 className="text-h1 mb-1">Your Profile</h1>
          <p className="text-muted-foreground text-sm">Update your personal info and learning preferences</p>
        </div>

        <div className="space-y-4">
          {/* Name & Email */}
          <CosmicCard className="p-5" hover={false}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm">Full Name</Label>
                <Input
                  id="name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Your name"
                  className="mt-1 bg-background/50"
                />
              </div>
              <div>
                <Label className="text-sm">Email</Label>
                <Input value={user?.email || ''} disabled className="mt-1 bg-muted/50" />
              </div>
            </div>
          </CosmicCard>

          {/* Experience Level */}
          <CosmicCard className="p-5" hover={false}>
            <Label className="text-sm mb-3 block">Experience Level</Label>
            <RadioGroup
              value={profile.experience_level}
              onValueChange={(v) => setProfile({ ...profile, experience_level: v })}
              className="space-y-2"
            >
              {radioOption('beginner', 'Beginner', "I'm just starting out", profile.experience_level === 'beginner')}
              {radioOption('intermediate', 'Intermediate', "I've tried some things", profile.experience_level === 'intermediate')}
              {radioOption('advanced', 'Advanced', 'I have real experience', profile.experience_level === 'advanced')}
            </RadioGroup>
          </CosmicCard>

          {/* Learning Style */}
          <CosmicCard className="p-5" hover={false}>
            <Label className="text-sm mb-3 block">Learning Style</Label>
            <RadioGroup
              value={profile.learning_style}
              onValueChange={(v) => setProfile({ ...profile, learning_style: v })}
              className="space-y-2"
            >
              {radioOption('visual', 'Visual', 'Videos, diagrams, infographics', profile.learning_style === 'visual')}
              {radioOption('reading', 'Reading', 'Articles, guides, written content', profile.learning_style === 'reading')}
              {radioOption('hands-on', 'Hands-on', 'Projects, exercises, practice', profile.learning_style === 'hands-on')}
              {radioOption('mixed', 'Mixed', 'A bit of everything', profile.learning_style === 'mixed')}
            </RadioGroup>
          </CosmicCard>

          {/* Time Commitment */}
          <CosmicCard className="p-5" hover={false}>
            <Label className="text-sm mb-3 block">Time Commitment</Label>
            <RadioGroup
              value={profile.time_commitment}
              onValueChange={(v) => setProfile({ ...profile, time_commitment: v })}
              className="space-y-2"
            >
              {radioOption('casual', 'Casual', '1-2 hours/week', profile.time_commitment === 'casual')}
              {radioOption('moderate', 'Moderate', '3-5 hours/week', profile.time_commitment === 'moderate')}
              {radioOption('intensive', 'Intensive', '6+ hours/week', profile.time_commitment === 'intensive')}
            </RadioGroup>
          </CosmicCard>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-primary hover:bg-primary/90 gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

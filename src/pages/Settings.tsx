import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, User, Palette, Bell, Shield } from 'lucide-react';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    experience_level: 'beginner',
    learning_style: 'mixed',
    time_commitment: 'moderate',
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

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

    fetchProfile();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', session.user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated.',
      });
    }
    setSaving(false);
  };

  return (
    <DashboardLayout loading={loading}>
      <div className="max-w-3xl mx-auto">
        <h1 className="font-sora text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">
          Manage your account and learning preferences
        </p>

        <div className="space-y-6">
          {/* Profile Section */}
          <CosmicCard className="p-6" hover={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-outfit font-semibold">Profile</h2>
                <p className="text-sm text-muted-foreground">Your personal information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your name"
                  className="mt-1 bg-background/50"
                />
              </div>
            </div>
          </CosmicCard>

          {/* Learning Preferences */}
          <CosmicCard className="p-6" hover={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-outfit font-semibold">Learning Preferences</h2>
                <p className="text-sm text-muted-foreground">Customize your learning experience</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base">Experience Level</Label>
                <RadioGroup
                  value={profile.experience_level}
                  onValueChange={(value) => setProfile({ ...profile, experience_level: value })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner" className="font-normal">Beginner - Just starting out</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate" className="font-normal">Intermediate - Some experience</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced" className="font-normal">Advanced - Experienced entrepreneur</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base">Learning Style</Label>
                <RadioGroup
                  value={profile.learning_style}
                  onValueChange={(value) => setProfile({ ...profile, learning_style: value })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="visual" id="visual" />
                    <Label htmlFor="visual" className="font-normal">Visual - I learn best from diagrams and videos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reading" id="reading" />
                    <Label htmlFor="reading" className="font-normal">Reading - I prefer detailed written content</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hands-on" id="hands-on" />
                    <Label htmlFor="hands-on" className="font-normal">Hands-on - I learn by doing exercises</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <Label htmlFor="mixed" className="font-normal">Mixed - A combination of all styles</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base">Time Commitment</Label>
                <RadioGroup
                  value={profile.time_commitment}
                  onValueChange={(value) => setProfile({ ...profile, time_commitment: value })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="font-normal">Light - 1-2 hours per week</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate" className="font-normal">Moderate - 3-5 hours per week</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intensive" id="intensive" />
                    <Label htmlFor="intensive" className="font-normal">Intensive - 6+ hours per week</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CosmicCard>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90 glow-primary"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

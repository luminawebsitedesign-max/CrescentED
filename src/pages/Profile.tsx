import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/crescented';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<Profile>>({
    full_name: '',
    experience_level: 'beginner',
    learning_style: 'mixed',
    time_commitment: 'moderate',
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        setTimeout(() => loadProfile(session.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        loadProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          experience_level: data.experience_level || 'beginner',
          learning_style: data.learning_style || 'mixed',
          time_commitment: data.time_commitment || 'moderate',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
        });

      if (error) throw error;

      toast.success('Profile updated!');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground">
            Update your learning preferences
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 p-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profile.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Your name"
              className="bg-background/50"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={user?.email || ''}
              disabled
              className="bg-muted/50"
            />
          </div>

          {/* Experience Level */}
          <div className="space-y-3">
            <Label>Experience Level</Label>
            <RadioGroup
              value={profile.experience_level}
              onValueChange={(value) => setProfile({ ...profile, experience_level: value })}
              className="space-y-2"
            >
              {[
                { value: 'beginner', label: 'Beginner', desc: "I'm just starting out" },
                { value: 'intermediate', label: 'Intermediate', desc: "I've tried some things" },
                { value: 'advanced', label: 'Advanced', desc: 'I have real experience' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-background/30 cursor-pointer hover:bg-background/50 transition-colors"
                >
                  <RadioGroupItem value={option.value} className="mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.desc}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Learning Style */}
          <div className="space-y-3">
            <Label>Learning Style</Label>
            <RadioGroup
              value={profile.learning_style}
              onValueChange={(value) => setProfile({ ...profile, learning_style: value })}
              className="space-y-2"
            >
              {[
                { value: 'visual', label: 'Visual', desc: 'Videos, diagrams, infographics' },
                { value: 'reading', label: 'Reading', desc: 'Articles, guides, written content' },
                { value: 'hands-on', label: 'Hands-on', desc: 'Projects, exercises, practice' },
                { value: 'mixed', label: 'Mixed', desc: 'A bit of everything' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-background/30 cursor-pointer hover:bg-background/50 transition-colors"
                >
                  <RadioGroupItem value={option.value} className="mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.desc}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Time Commitment */}
          <div className="space-y-3">
            <Label>Time Commitment</Label>
            <RadioGroup
              value={profile.time_commitment}
              onValueChange={(value) => setProfile({ ...profile, time_commitment: value })}
              className="space-y-2"
            >
              {[
                { value: 'casual', label: 'Casual', desc: '1-2 hours/week' },
                { value: 'moderate', label: 'Moderate', desc: '3-5 hours/week' },
                { value: 'intensive', label: 'Intensive', desc: '6+ hours/week' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-background/30 cursor-pointer hover:bg-background/50 transition-colors"
                >
                  <RadioGroupItem value={option.value} className="mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.desc}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full gap-2 bg-gradient-to-r from-primary to-accent"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}

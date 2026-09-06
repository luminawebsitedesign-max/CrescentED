import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, getProfile, saveProfile, deleteCourseData, deleteAllUserData, generateCourse } from '@/lib/api';
import { DEMO_MODE } from '@/lib/demo';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/store/useStore';
import { 
  Loader2, Save, User, Palette, StickyNote, 
  BookOpen, AlertTriangle, RefreshCw, Trash2, PenLine 
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import SEO from '@/components/SEO';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [masterNotes, setMasterNotes] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [profile, setProfile] = useState({
    full_name: '',
    experience_level: 'beginner',
    learning_style: 'mixed',
    time_commitment: 'moderate',
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { intake, setModules, setCurrentModuleId, setIntake, setCourse, reset } = useStore();

  useEffect(() => {
    const notes = localStorage.getItem('crescented-master-notes') || '';
    setMasterNotes(notes);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const session = await getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

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

    fetchProfile();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    const session = await getSession();
    if (!session) {
      setSaving(false);
      return;
    }

    try {
      await saveProfile(session.user.id, profile);
      localStorage.setItem('crescented-master-notes', masterNotes);
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    }
    setSaving(false);
  };

  // Clear all chat histories from localStorage
  const clearAllChatHistories = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('crescented-chat-') || 
          key.startsWith('crescented-modules') ||
          key.startsWith('crescented-tutor')) {
        localStorage.removeItem(key);
      }
    });
    sessionStorage.clear();
  };

  // Regenerate Course - keeps profile, resets course content
  const handleRegenerateCourse = async () => {
    if (confirmText !== 'REGENERATE') return;
    
    setRegenerating(true);
    const session = await getSession();
    if (!session || !intake) {
      toast({
        title: 'Error',
        description: 'Please complete your profile first',
        variant: 'destructive',
      });
      setRegenerating(false);
      return;
    }

    try {
      await deleteCourseData(session.user.id);

      // Clear local state immediately
      setModules([]);
      setCurrentModuleId(null);
      setCourse(null);

      // Clear all localStorage caches
      clearAllChatHistories();

      toast({
        title: DEMO_MODE ? 'Reloading sample course...' : 'Generating new course...',
        description: DEMO_MODE ? 'One moment.' : 'This may take a minute. Please wait.',
      });

      const result = await generateCourse(intake, session.user.id);

      if (result.modules.length > 0) {
        setModules(result.modules as never);
        setCurrentModuleId(result.modules[0].id);
      }

      toast({
        title: result.sample ? 'Sample course reloaded' : 'Course regenerated!',
        description: `${result.modulesCount} modules ready.`,
      });

      setConfirmText('');
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to regenerate course',
        variant: 'destructive',
      });
    } finally {
      setRegenerating(false);
    }
  };

  // Delete Course & Start New - resets EVERYTHING except auth
  const handleDeleteAndStartNew = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    
    setDeleting(true);
    const session = await getSession();
    if (!session) {
      setDeleting(false);
      return;
    }

    try {
      await deleteAllUserData(session.user.id);
      
      // Reset all local state
      reset();
      
      // Clear ALL crescented localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('crescented-')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();

      toast({
        title: 'Account reset',
        description: 'All course data has been deleted. Starting fresh!',
      });

      setDeleteConfirmText('');
      navigate('/intake');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset account',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout loading={loading}>
        <SEO
          title="Account Settings — CrescentEd"
          description="Manage your CrescentEd profile, learning preferences, master notes, and course management options."
          path="/settings"
        />
        <div className="max-w-2xl mx-auto pb-8">
          <h1 className="font-sora text-2xl font-bold mb-1">Account</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Manage your profile, preferences, and course settings
          </p>

          <div className="space-y-4">
            {/* Master Notes Section */}
            <CosmicCard className="p-5" hover={false}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-cosmic-violet/10 flex items-center justify-center flex-shrink-0">
                  <StickyNote className="w-4 h-4 text-cosmic-violet" />
                </div>
                <div>
                  <h2 className="font-outfit font-semibold text-sm">Master Notes</h2>
                  <p className="text-xs text-muted-foreground">Things the AI should always know about you</p>
                </div>
              </div>
              <Label htmlFor="master-notes" className="sr-only">Master notes for the AI</Label>
              <Textarea
                id="master-notes"
                value={masterNotes}
                onChange={(e) => setMasterNotes(e.target.value)}
                placeholder="e.g., I'm building a SaaS for local gyms. I prefer step-by-step guidance. I have 10 hours per week..."
                className="min-h-[100px] bg-background/50 text-sm"
              />
            </CosmicCard>

            {/* Profile Section */}
            <CosmicCard className="p-5" hover={false}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-outfit font-semibold text-sm">Profile</h2>
                  <p className="text-xs text-muted-foreground">Your personal information</p>
                </div>
              </div>

              <div>
                <Label htmlFor="name" className="text-sm">Full Name</Label>
                <Input
                  id="name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your name"
                  className="mt-1 bg-background/50"
                />
              </div>
            </CosmicCard>

            {/* Learning Preferences */}
            <CosmicCard className="p-5" hover={false}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Palette className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h2 className="font-outfit font-semibold text-sm">Learning Preferences</h2>
                  <p className="text-xs text-muted-foreground">Customize your experience</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="text-sm">Experience Level</Label>
                  <RadioGroup
                    value={profile.experience_level}
                    onValueChange={(value) => setProfile({ ...profile, experience_level: value })}
                    className="mt-2 space-y-1.5"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner" className="font-normal text-sm">Beginner</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate" className="font-normal text-sm">Intermediate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced" className="font-normal text-sm">Advanced</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm">Learning Style</Label>
                  <RadioGroup
                    value={profile.learning_style}
                    onValueChange={(value) => setProfile({ ...profile, learning_style: value })}
                    className="mt-2 space-y-1.5"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="visual" id="visual" />
                      <Label htmlFor="visual" className="font-normal text-sm">Visual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="reading" id="reading" />
                      <Label htmlFor="reading" className="font-normal text-sm">Reading</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hands-on" id="hands-on" />
                      <Label htmlFor="hands-on" className="font-normal text-sm">Hands-on</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mixed" id="mixed" />
                      <Label htmlFor="mixed" className="font-normal text-sm">Mixed</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm">Time Commitment</Label>
                  <RadioGroup
                    value={profile.time_commitment}
                    onValueChange={(value) => setProfile({ ...profile, time_commitment: value })}
                    className="mt-2 space-y-1.5"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light" className="font-normal text-sm">Light (1-2 hrs/week)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="moderate" id="moderate" />
                      <Label htmlFor="moderate" className="font-normal text-sm">Moderate (3-5 hrs/week)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intensive" id="intensive" />
                      <Label htmlFor="intensive" className="font-normal text-sm">Intensive (6+ hrs/week)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CosmicCard>

            {/* Edit Onboarding */}
            <CosmicCard className="p-5" hover={false}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <PenLine className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-outfit font-semibold text-sm">Onboarding Answers</h2>
                  <p className="text-xs text-muted-foreground">Update your business idea, goals, and preferences</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/intake?edit=true')}
              >
                <PenLine className="w-4 h-4 mr-2" />
                Edit Onboarding Answers
              </Button>
            </CosmicCard>

            {/* Course Management */}
            <CosmicCard className="p-5" hover={false}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <h2 className="font-outfit font-semibold text-sm">Course Management</h2>
                  <p className="text-xs text-muted-foreground">Reset or regenerate your learning path</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Regenerate Course Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate Course
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-primary" />
                        Regenerate Course?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>This will delete all modules, PDFs, and chat history, then generate a fresh course based on your current intake form.</p>
                        <p><strong>Keeps:</strong> Your profile and intake data</p>
                        <p><strong>Resets:</strong> Modules, PDFs, tools outputs, chat history</p>
                        <p className="font-medium">Type REGENERATE to confirm:</p>
                        <Input
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder="REGENERATE"
                          className="mt-2"
                        />
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setConfirmText('')}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleRegenerateCourse}
                        disabled={confirmText !== 'REGENERATE' || regenerating}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {regenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          'Confirm Regenerate'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Delete & Start New Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Course & Start New
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        Delete Everything?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>This will permanently delete ALL your data and cannot be undone.</p>
                        <p><strong>Deletes:</strong> All modules, chat history, PDFs, tools outputs, and intake form</p>
                        <p><strong>Keeps:</strong> Only your login credentials</p>
                        <p className="font-medium">Type DELETE to confirm:</p>
                        <Input
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="DELETE"
                          className="mt-2"
                        />
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAndStartNew}
                        disabled={deleteConfirmText !== 'DELETE' || deleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Delete Everything'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CosmicCard>

            {/* Save Button */}
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
    </DashboardLayout>
  );
};

export default Settings;

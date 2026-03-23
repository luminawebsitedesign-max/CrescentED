import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, ArrowLeft, Sparkles, Save } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import CrescentLogo from '@/components/ui/crescent-logo';

const STEPS_NEW = [
  { id: 'idea', title: 'Your Big Idea', subtitle: 'What do you want to build?' },
  { id: 'goals', title: 'Your Goals', subtitle: 'What do you want to achieve?' },
  { id: 'background', title: 'About You', subtitle: 'Help us understand your journey' },
  { id: 'style', title: 'Learning Style', subtitle: 'How do you learn best?' },
];

const STEPS_EDIT = [
  { id: 'idea', title: 'Edit Your Idea', subtitle: 'Update your business idea and interests' },
  { id: 'goals', title: 'Edit Your Goals', subtitle: 'Refine what you want to achieve' },
  { id: 'background', title: 'Edit Your Background', subtitle: 'Update your experience info' },
  { id: 'style', title: 'Edit Learning Style', subtitle: 'Change how you prefer to learn' },
];

const Intake = () => {
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [existingIntakeId, setExistingIntakeId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    idea: '',
    goals: '',
    background: '',
    experience_level: 'beginner',
    interests: '',
    constraints: '',
    learning_style: 'mixed',
    commitment_level: 'moderate',
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUserId(session.user.id);
      
      // Check if user already has an intake form
      const { data: existing } = await supabase
        .from('intake_forms')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (existing) {
        if (isEditMode) {
          // Load existing data for editing
          setExistingIntakeId(existing.id);
          setFormData({
            idea: existing.idea || '',
            goals: existing.goals || '',
            background: existing.background || '',
            experience_level: existing.experience_level || 'beginner',
            interests: existing.interests || '',
            constraints: existing.constraints || '',
            learning_style: existing.learning_style || 'mixed',
            commitment_level: existing.commitment_level || 'moderate',
          });
        } else {
          // Not in edit mode and intake exists - go to dashboard
          navigate('/dashboard');
          return;
        }
      } else if (isEditMode) {
        // Edit mode but no intake exists - redirect to regular intake
        navigate('/intake');
        return;
      }
      
      setInitialLoading(false);
    };
    checkAuth();
  }, [navigate, isEditMode]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!userId) return;
    
    if (!formData.idea.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please describe your business idea',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.goals.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please describe your goals',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);

    try {
      if (isEditMode && existingIntakeId) {
        // Update existing intake form - DO NOT regenerate course
        const { error: intakeError } = await supabase
          .from('intake_forms')
          .update({
            ...formData,
          })
          .eq('id', existingIntakeId);

        if (intakeError) throw intakeError;

        toast({
          title: 'Profile updated!',
          description: 'Your learning preferences have been saved.',
        });

        navigate('/dashboard');
      } else {
        // New intake - save and generate course
        const { error: intakeError } = await supabase
          .from('intake_forms')
          .insert({
            user_id: userId,
            ...formData,
          });

        if (intakeError) throw intakeError;

        // Generate course immediately
        try {
          const response = await supabase.functions.invoke('crescented-ai', {
            body: {
              type: 'generate_course',
              intake: formData,
              userId: userId,
            },
          });

          if (response.error) {
            throw new Error(response.error.message || 'Generation failed');
          }

          if (response.data?.error) {
            throw new Error(response.data.error);
          }

          toast({
            title: 'Course generated!',
            description: `Created ${response.data?.modulesCount || 5} modules for you.`,
          });
          navigate('/dashboard');
        } catch (genError: any) {
          console.error('Course generation error:', genError);
          toast({
            title: 'Course generation failed',
            description: 'Your profile is saved. You can generate your course from the Dashboard.',
            variant: 'destructive',
          });
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save your profile',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background noise-texture flex items-center justify-center p-6">
      <div className="fixed inset-0 aurora-overlay pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CrescentLogo size="sm" />
            <span className="font-sora text-xl font-bold text-gradient-cosmic">CrescentEd</span>
          </div>
          {isEditMode && (
            <p className="text-sm text-primary mb-2">Editing your profile</p>
          )}
          <Progress value={progress} className="h-2 bg-secondary" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>

        <div className="glass-cosmic rounded-2xl p-8">
          <h2 className="font-sora text-2xl font-bold mb-2">{STEPS[step].title}</h2>
          <p className="text-muted-foreground mb-6">{STEPS[step].subtitle}</p>

          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="idea">Describe your business idea</Label>
                <Textarea
                  id="idea"
                  placeholder="e.g., An app that helps students find study partners..."
                  value={formData.idea}
                  onChange={(e) => updateField('idea', e.target.value)}
                  className="mt-2 min-h-[120px] bg-secondary/50 border-border"
                />
              </div>
              <div>
                <Label htmlFor="interests">What topics interest you?</Label>
                <Input
                  id="interests"
                  placeholder="e.g., technology, sustainability, education..."
                  value={formData.interests}
                  onChange={(e) => updateField('interests', e.target.value)}
                  className="mt-2 bg-secondary/50 border-border"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="goals">What do you want to achieve?</Label>
                <Textarea
                  id="goals"
                  placeholder="e.g., Launch an MVP in 3 months, get my first 100 users..."
                  value={formData.goals}
                  onChange={(e) => updateField('goals', e.target.value)}
                  className="mt-2 min-h-[120px] bg-secondary/50 border-border"
                />
              </div>
              <div>
                <Label htmlFor="constraints">Any constraints or challenges?</Label>
                <Input
                  id="constraints"
                  placeholder="e.g., limited budget, part-time availability..."
                  value={formData.constraints}
                  onChange={(e) => updateField('constraints', e.target.value)}
                  className="mt-2 bg-secondary/50 border-border"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="background">Tell us about yourself</Label>
                <Textarea
                  id="background"
                  placeholder="e.g., I'm a college student interested in starting my first business..."
                  value={formData.background}
                  onChange={(e) => updateField('background', e.target.value)}
                  className="mt-2 min-h-[100px] bg-secondary/50 border-border"
                />
              </div>
              <div>
                <Label className="mb-3 block">Your experience level</Label>
                <RadioGroup
                  value={formData.experience_level}
                  onValueChange={(value) => updateField('experience_level', value)}
                  className="grid grid-cols-3 gap-4"
                >
                  {[
                    { value: 'beginner', label: 'Beginner', desc: 'New to business' },
                    { value: 'intermediate', label: 'Some Experience', desc: 'Tried a few things' },
                    { value: 'advanced', label: 'Experienced', desc: 'Built businesses before' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex flex-col items-center p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.experience_level === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value={option.value} className="sr-only" />
                      <span className="font-medium text-sm">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.desc}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">How do you learn best?</Label>
                <RadioGroup
                  value={formData.learning_style}
                  onValueChange={(value) => updateField('learning_style', value)}
                  className="grid grid-cols-2 gap-4"
                >
                  {[
                    { value: 'visual', label: 'Visual', desc: 'Diagrams & videos' },
                    { value: 'reading', label: 'Reading', desc: 'Text & articles' },
                    { value: 'hands-on', label: 'Hands-on', desc: 'Learning by doing' },
                    { value: 'mixed', label: 'Mixed', desc: 'A bit of everything' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex flex-col items-center p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.learning_style === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value={option.value} className="sr-only" />
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.desc}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <Label className="mb-3 block">How much time can you commit?</Label>
                <RadioGroup
                  value={formData.commitment_level}
                  onValueChange={(value) => updateField('commitment_level', value)}
                  className="grid grid-cols-3 gap-4"
                >
                  {[
                    { value: 'casual', label: 'Casual', desc: '1-2 hrs/week' },
                    { value: 'moderate', label: 'Moderate', desc: '3-5 hrs/week' },
                    { value: 'intensive', label: 'Intensive', desc: '10+ hrs/week' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex flex-col items-center p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.commitment_level === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value={option.value} className="sr-only" />
                      <span className="font-medium text-sm">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.desc}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {(step > 0 || isEditMode) && (
              <Button
                variant="outline"
                onClick={isEditMode && step === 0 ? () => navigate('/dashboard') : step === 0 ? () => navigate('/') : handleBack}
                className="border-border"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                {isEditMode && step === 0 ? 'Cancel' : 'Back'}
              </Button>
            )}
            {step === 0 && !isEditMode && <div />}
            
            {step < STEPS.length - 1 ? (
              <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
                Next
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 glow-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Saving...' : 'Creating your path...'}
                  </>
                ) : isEditMode ? (
                  <>
                    <Save className="mr-2 w-4 h-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 w-4 h-4" />
                    Generate My Course
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intake;

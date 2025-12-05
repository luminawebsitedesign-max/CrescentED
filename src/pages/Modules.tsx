import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { CourseData, DOMAIN_ICONS, DOMAIN_LABELS } from '@/types/crescented';

export default function Modules() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        setTimeout(() => loadCourse(session.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        loadCourse(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadCourse = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data?.course_data) {
        setCourse(data.course_data as unknown as CourseData);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading modules...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Your Modules</h1>
          <p className="text-muted-foreground">
            {course?.description || 'Complete modules to progress through your course'}
          </p>
        </div>

        {course?.modules && course.modules.length > 0 ? (
          <div className="space-y-4">
            {course.modules.map((module, index) => {
              const completedLessons = module.lessons?.filter((l) =>
                course.progress?.completedLessons?.includes(l.id)
              ).length || 0;
              const totalLessons = module.lessons?.length || 0;
              const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
              const isCompleted = progress === 100;

              return (
                <button
                  key={module.id}
                  onClick={() => navigate(`/modules/${module.id}`)}
                  className={`w-full bg-card/50 backdrop-blur-xl rounded-xl p-6 border transition-all text-left group ${
                    isCompleted ? 'border-green-500/30' : 'border-border/50 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      isCompleted ? 'bg-green-500/20' : 'bg-primary/20'
                    }`}>
                      {DOMAIN_ICONS[module.domain] || '📚'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                          Module {index + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {DOMAIN_LABELS[module.domain] || module.domain}
                        </span>
                        {isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {module.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {module.summary}
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-2">
                          <Progress value={progress} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {completedLessons}/{totalLessons} lessons
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-card/30 backdrop-blur-xl rounded-2xl border border-border/30 p-12 text-center">
            <p className="text-muted-foreground mb-4">No modules found</p>
            <Button onClick={() => navigate('/intake')}>
              Complete Intake Form
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

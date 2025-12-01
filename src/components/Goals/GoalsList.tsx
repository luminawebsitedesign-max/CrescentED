import { useState, useEffect } from 'react';
import { Plus, Trash2, Target, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Goal, Milestone } from '@/types';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const GoalsList = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: new Date().toISOString().split('T')[0],
    milestones: [] as Milestone[],
  });
  const [newMilestone, setNewMilestone] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    const storedGoals = storage.getGoals();
    setGoals(storedGoals);
  };

  const addGoal = () => {
    if (!newGoal.title.trim()) {
      toast.error('Goal title is required');
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    storage.saveGoals(updatedGoals);
    setNewGoal({
      title: '',
      description: '',
      targetDate: new Date().toISOString().split('T')[0],
      milestones: [],
    });
    setIsAddingGoal(false);
    toast.success('Goal created');
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;

    setNewGoal({
      ...newGoal,
      milestones: [
        ...newGoal.milestones,
        {
          id: Date.now().toString(),
          title: newMilestone,
          completed: false,
        },
      ],
    });
    setNewMilestone('');
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id !== goalId) return goal;

      const milestones = goal.milestones.map(m =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );

      const completedCount = milestones.filter(m => m.completed).length;
      const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

      return { ...goal, milestones, progress };
    });

    setGoals(updatedGoals);
    storage.saveGoals(updatedGoals);
  };

  const deleteGoal = (id: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== id);
    setGoals(updatedGoals);
    storage.saveGoals(updatedGoals);
    toast.success('Goal deleted');
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-orbitron">Long-Term Goals</h2>
        <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
          <DialogTrigger asChild>
            <Button className="glow-cyan gap-2">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="cyber-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-orbitron">Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Goal title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              />
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Target Date</label>
                <Input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Milestones</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a milestone"
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addMilestone()}
                  />
                  <Button onClick={addMilestone} variant="outline">Add</Button>
                </div>
                <div className="space-y-1">
                  {newGoal.milestones.map(milestone => (
                    <div key={milestone.id} className="flex items-center gap-2 text-sm p-2 bg-muted/20 rounded">
                      <Circle className="h-3 w-3" />
                      {milestone.title}
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={addGoal} className="w-full glow-purple">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground cyber-border">
            <p>No goals set yet. Create your first goal and break it down into milestones!</p>
          </Card>
        ) : (
          goals.map(goal => {
            const daysRemaining = getDaysRemaining(goal.targetDate);
            const completedMilestones = goal.milestones.filter(m => m.completed).length;

            return (
              <Card key={goal.id} className="p-6 transition-all hover:glow-cyan">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-orbitron mb-2">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className={cn(
                          daysRemaining < 0 && "text-destructive",
                          daysRemaining < 7 && daysRemaining >= 0 && "text-secondary",
                        )}>
                          {daysRemaining < 0 ? "Overdue" : `${daysRemaining} days remaining`}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        {completedMilestones} / {goal.milestones.length} milestones
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-orbitron">{Math.round(goal.progress)}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>

                {goal.milestones.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Milestones</h4>
                    {goal.milestones.map(milestone => (
                      <div
                        key={milestone.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded border border-border hover:bg-muted/20 transition-colors cursor-pointer",
                          milestone.completed && "opacity-60"
                        )}
                        onClick={() => toggleMilestone(goal.id, milestone.id)}
                      >
                        {milestone.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                        <span className={cn(
                          "text-sm",
                          milestone.completed && "line-through"
                        )}>
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

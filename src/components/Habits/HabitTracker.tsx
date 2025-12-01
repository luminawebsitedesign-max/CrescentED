import { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Habit, Frequency } from '@/types';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const HabitTracker = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    frequency: 'daily' as Frequency,
  });

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = () => {
    const storedHabits = storage.getHabits();
    setHabits(storedHabits);
  };

  const addHabit = () => {
    if (!newHabit.name.trim()) {
      toast.error('Habit name is required');
      return;
    }

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      frequency: newHabit.frequency,
      streak: 0,
      completions: [],
      createdAt: new Date().toISOString(),
    };

    const updatedHabits = [...habits, habit];
    setHabits(updatedHabits);
    storage.saveHabits(updatedHabits);
    setNewHabit({ name: '', frequency: 'daily' });
    setIsAddingHabit(false);
    toast.success('Habit created');
  };

  const toggleHabitToday = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedHabits = habits.map(habit => {
      if (habit.id !== id) return habit;

      const completions = habit.completions.includes(today)
        ? habit.completions.filter(date => date !== today)
        : [...habit.completions, today];

      // Calculate streak
      let streak = 0;
      const sortedCompletions = [...completions].sort().reverse();
      let currentDate = new Date();
      
      for (const completion of sortedCompletions) {
        const completionDate = new Date(completion);
        const daysDiff = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 1) {
          streak++;
          currentDate = completionDate;
        } else {
          break;
        }
      }

      return { ...habit, completions, streak };
    });

    setHabits(updatedHabits);
    storage.saveHabits(updatedHabits);
  };

  const deleteHabit = (id: string) => {
    const updatedHabits = habits.filter(habit => habit.id !== id);
    setHabits(updatedHabits);
    storage.saveHabits(updatedHabits);
    toast.success('Habit deleted');
  };

  const isCompletedToday = (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.completions.includes(today);
  };

  const getSuccessRate = (habit: Habit) => {
    if (habit.completions.length === 0) return 0;
    const daysSinceCreation = Math.floor(
      (new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const expectedCompletions = habit.frequency === 'daily' ? daysSinceCreation : Math.floor(daysSinceCreation / 7);
    return Math.min(100, Math.round((habit.completions.length / Math.max(1, expectedCompletions)) * 100));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-orbitron">Habit Tracker</h2>
        <Dialog open={isAddingHabit} onOpenChange={setIsAddingHabit}>
          <DialogTrigger asChild>
            <Button className="glow-cyan gap-2">
              <Plus className="h-4 w-4" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="cyber-border">
            <DialogHeader>
              <DialogTitle className="font-orbitron">Create New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Habit name"
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
              />
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Frequency</label>
                <Select value={newHabit.frequency} onValueChange={(value: Frequency) => setNewHabit({ ...newHabit, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addHabit} className="w-full glow-purple">
                Create Habit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.length === 0 ? (
          <Card className="col-span-2 p-8 text-center text-muted-foreground cyber-border">
            <p>No habits tracked yet. Create your first habit to start building streaks!</p>
          </Card>
        ) : (
          habits.map(habit => (
            <Card
              key={habit.id}
              className={cn(
                "p-6 transition-all hover:glow-cyan",
                isCompletedToday(habit) && "glow-purple"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    checked={isCompletedToday(habit)}
                    onCheckedChange={() => toggleHabitToday(habit.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{habit.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{habit.frequency}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteHabit(habit.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-orbitron text-primary">{habit.streak}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Current Streak
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-orbitron text-secondary">{habit.completions.length}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Total
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-orbitron text-accent">{getSuccessRate(habit)}%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>

              {/* Mini Calendar - Last 7 days */}
              <div className="mt-4 flex gap-1 justify-center">
                {Array.from({ length: 7 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - i));
                  const dateStr = date.toISOString().split('T')[0];
                  const isCompleted = habit.completions.includes(dateStr);
                  
                  return (
                    <div
                      key={i}
                      className={cn(
                        "w-8 h-8 rounded border",
                        isCompleted ? "bg-primary/20 border-primary" : "border-border bg-muted/20"
                      )}
                      title={dateStr}
                    />
                  );
                })}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

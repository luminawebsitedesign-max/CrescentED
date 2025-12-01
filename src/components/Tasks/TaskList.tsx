import { useState, useEffect } from 'react';
import { Plus, Calendar, Flag, Trash2, Edit2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Task, Priority, Project } from '@/types';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TaskListProps {
  filter?: 'all' | 'today' | 'week';
  projectId?: string;
}

export const TaskList = ({ filter = 'all', projectId }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium' as Priority,
    projectId: 'default',
  });

  useEffect(() => {
    loadTasks();
    loadProjects();
  }, []);

  const loadTasks = () => {
    const storedTasks = storage.getTasks();
    setTasks(storedTasks);
  };

  const loadProjects = () => {
    const storedProjects = storage.getProjects();
    if (storedProjects.length === 0) {
      const defaultProject: Project = {
        id: 'default',
        name: 'General',
        color: 'cyan',
        createdAt: new Date().toISOString(),
      };
      storage.saveProjects([defaultProject]);
      setProjects([defaultProject]);
    } else {
      setProjects(storedProjects);
    }
  };

  const addTask = () => {
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
      order: tasks.length,
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
    setNewTask({
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      projectId: 'default',
    });
    setIsAddingTask(false);
    toast.success('Task created');
  };

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
    toast.success('Task deleted');
  };

  const updateTask = () => {
    if (!editingTask) return;
    const updatedTasks = tasks.map(task =>
      task.id === editingTask.id ? editingTask : task
    );
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
    setEditingTask(null);
    toast.success('Task updated');
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-secondary';
      case 'low': return 'text-muted-foreground';
    }
  };

  const filterTasks = () => {
    let filtered = tasks;
    
    if (projectId) {
      filtered = filtered.filter(task => task.projectId === projectId);
    }

    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(task => task.dueDate === today);
    } else if (filter === 'week') {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      filtered = filtered.filter(task => new Date(task.dueDate) <= weekFromNow);
    }

    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.order - b.order;
    });
  };

  const filteredTasks = filterTasks();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-orbitron">Tasks</h2>
        <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
          <DialogTrigger asChild>
            <Button className="glow-cyan gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="cyber-border">
            <DialogHeader>
              <DialogTitle className="font-orbitron">Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Due Date</label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Priority</label>
                  <Select value={newTask.priority} onValueChange={(value: Priority) => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Project</label>
                <Select value={newTask.projectId} onValueChange={(value) => setNewTask({ ...newTask, projectId: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addTask} className="w-full glow-purple">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground cyber-border">
            <p>No tasks found. Create your first task to get started!</p>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <Card
              key={task.id}
              className={cn(
                "p-4 transition-all hover:glow-cyan",
                task.completed && "opacity-60"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className={cn(
                      "font-medium",
                      task.completed && "line-through"
                    )}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                      <div className={cn("flex items-center gap-1", getPriorityColor(task.priority))}>
                        <Flag className="h-3 w-3" />
                        {task.priority}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingTask(task)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="cyber-border">
          <DialogHeader>
            <DialogTitle className="font-orbitron">Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <Input
                placeholder="Task title"
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={editingTask.description}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              />
              <Button onClick={updateTask} className="w-full glow-purple">
                Update Task
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

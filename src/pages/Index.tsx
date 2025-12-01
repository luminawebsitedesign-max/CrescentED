import { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { TaskList } from '@/components/Tasks/TaskList';
import { HabitTracker } from '@/components/Habits/HabitTracker';
import { GoalsList } from '@/components/Goals/GoalsList';
import { AIChat } from '@/components/AI/AIChat';
import { SettingsView } from '@/components/Settings/SettingsView';

const Index = () => {
  const [currentView, setCurrentView] = useState<'tasks' | 'habits' | 'goals' | 'ai' | 'settings'>('tasks');

  return (
    <MainLayout currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'tasks' && <TaskList />}
      {currentView === 'habits' && <HabitTracker />}
      {currentView === 'goals' && <GoalsList />}
      {currentView === 'ai' && <AIChat />}
      {currentView === 'settings' && <SettingsView />}
    </MainLayout>
  );
};

export default Index;

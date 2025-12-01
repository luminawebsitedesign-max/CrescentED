import { useState } from 'react';
import { Moon, Sun, Download, Upload, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

export const SettingsView = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    document.documentElement.classList.contains('light') ? 'light' : 'dark'
  );
  const [apiKey, setApiKey] = useState(localStorage.getItem('nexus_openai_key') || '');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('nexus_openai_key', apiKey);
    toast.success('API key saved securely');
  };

  const exportData = () => {
    const data = storage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        storage.importData(data);
        toast.success('Data imported successfully. Refresh the page to see changes.');
      } catch (error) {
        toast.error('Failed to import data. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-orbitron">Settings</h2>

      {/* Theme */}
      <Card className="p-6 cyber-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium mb-1">Theme</h3>
            <p className="text-sm text-muted-foreground">
              Switch between light and dark mode
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="glow-cyan"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </Card>

      {/* OpenAI API Key */}
      <Card className="p-6 cyber-border">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">OpenAI API Key</h3>
            <p className="text-sm text-muted-foreground">
              Enter your OpenAI API key to enable AI features
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="apiKey" className="sr-only">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <Button onClick={saveApiKey} className="glow-purple gap-2">
              <Key className="h-4 w-4" />
              Save
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your API key is stored locally and never sent to our servers
          </p>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6 cyber-border">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Data Management</h3>
            <p className="text-sm text-muted-foreground">
              Export or import your tasks, habits, and goals
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={exportData} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <label htmlFor="import-file" className="cursor-pointer">
                <Upload className="h-4 w-4" />
                Import Data
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={importData}
                />
              </label>
            </Button>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="p-6 cyber-border">
        <div>
          <h3 className="font-medium mb-2">About NEXUS</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Version 1.0.0 - AI-Powered Productivity Suite
          </p>
          <p className="text-xs text-muted-foreground">
            NEXUS combines mystical aesthetics with cutting-edge AI to help you achieve your goals.
            All data is stored locally on your device for maximum privacy and security.
          </p>
        </div>
      </Card>
    </div>
  );
};

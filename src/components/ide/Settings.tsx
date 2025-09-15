'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, X, User, Palette, Code, Terminal, Save, Key, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [apiKey, setApiKey] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState('dark');
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'editor', label: 'Editor', icon: Code },
    { id: 'ai', label: 'AI Settings', icon: Key },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] bg-gray-900 border-gray-700 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Settings</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-700">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                    <Input
                      defaultValue={user?.displayName || ''}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Your display name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <Input
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-700 border-gray-600 text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['dark', 'darker'].map((themeOption) => (
                        <button
                          key={themeOption}
                          onClick={() => setTheme(themeOption)}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            theme === themeOption
                              ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                              : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="font-medium">{themeOption === 'dark' ? 'Dark' : 'Darker'}</div>
                          <div className="text-xs text-gray-400">
                            {themeOption === 'dark' ? 'Standard dark theme' : 'Higher contrast'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Editor Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={10}
                        max={24}
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-20 bg-gray-800 border-gray-600 text-white"
                      />
                      <span className="text-gray-400">px</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Font Family</label>
                    <select className="w-full p-2 bg-gray-800 border-gray-600 border rounded-lg text-white">
                      <option>JetBrains Mono</option>
                      <option>Fira Code</option>
                      <option>Source Code Pro</option>
                      <option>Monaco</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                    <label className="text-sm text-gray-300">Enable ligatures</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                    <label className="text-sm text-gray-300">Auto-save</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">AI Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                    <Input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Enter your AI API key"
                    />
                    <p className="text-xs text-gray-400 mt-1">Your API key is stored locally and never shared</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Default Model</label>
                    <select className="w-full p-2 bg-gray-800 border-gray-600 border rounded-lg text-white">
                      <option>Gemini Pro</option>
                      <option>Claude 3.5 Sonnet</option>
                      <option>GPT-4 Turbo</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                    <label className="text-sm text-gray-300">Auto-create files from AI responses</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                    <label className="text-sm text-gray-300">Enable terminal command execution</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Terminal Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Shell</label>
                    <select className="w-full p-2 bg-gray-800 border-gray-600 border rounded-lg text-white">
                      <option>PowerShell</option>
                      <option>Command Prompt</option>
                      <option>Bash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Terminal Font Size</label>
                    <Input
                      type="number"
                      min={10}
                      max={20}
                      defaultValue={12}
                      className="w-20 bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                    <label className="text-sm text-gray-300">Scroll on output</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-700 mt-8">
            <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Plus, LogOut, Settings, Code } from 'lucide-react';
import { IDE } from '@/components/ide/IDE';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const newProject: Project = {
        id: Math.random().toString(36).substr(2, 9),
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setProjects(prev => [...prev, newProject]);
      setNewProjectName('');
      setNewProjectDescription('');
      setShowNewProject(false);
    }
  };

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
  };

  if (selectedProject) {
    return <IDE project={selectedProject} onBack={() => setSelectedProject(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm font-bold">H</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Helix <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">IDE</span>
              </h1>
            </div>
            <span className="text-gray-400 font-medium">Welcome back, {user?.displayName || user?.email?.split('@')[0]}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-400 hover:text-white hover:bg-gray-800">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Your Projects</h2>
            <p className="text-gray-400 font-medium">Build, code, and deploy with AI assistance</p>
          </div>
          <Button 
            onClick={() => setShowNewProject(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {showNewProject && (
          <Card className="mb-8 bg-gray-800/50 border-gray-700 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white font-semibold">Create New Project</CardTitle>
              <p className="text-gray-400 text-sm">Start building something amazing</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                <Input
                  placeholder="My Awesome Project"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                <Input
                  placeholder="What are you building?"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <Button 
                  onClick={handleCreateProject}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                >
                  Create Project
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewProject(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:shadow-xl transition-all duration-200 bg-gray-800/50 border-gray-700 backdrop-blur-xl hover:bg-gray-800/70 group">
              <CardHeader>
                <CardTitle className="flex items-center text-white group-hover:text-blue-400 transition-colors">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3">
                    <Code className="w-4 h-4 text-white" />
                  </div>
                  {project.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {project.description || 'No description provided'}
                </p>
                <p className="text-xs text-gray-500 mb-4 font-medium">
                  Created {project.createdAt.toLocaleDateString()}
                </p>
                <Button 
                  onClick={() => handleOpenProject(project)} 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg"
                >
                  Open Project
                </Button>
              </CardContent>
            </Card>
          ))}

          {projects.length === 0 && !showNewProject && (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Code className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Ready to start coding?</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">Create your first project and experience the power of AI-assisted development</p>
              <Button 
                onClick={() => setShowNewProject(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
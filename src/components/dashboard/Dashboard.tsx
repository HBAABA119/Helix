'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Plus, LogOut, Settings, Code, Trash2, MoreVertical, Edit2 } from 'lucide-react';
import { IDE } from '@/components/ide/IDE';
import { Settings as SettingsComponent } from '@/components/ide/Settings';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  userId: string;
}

export function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);

  // Load projects from Firestore
  useEffect(() => {
    if (!user) return;

    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData: Project[] = [];
      snapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() } as Project);
      });
      // Sort by creation date, newest first
      projectsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setProjects(projectsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !user) return;

    try {
      const projectData = {
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await addDoc(collection(db, 'projects'), projectData);
      setNewProjectName('');
      setNewProjectDescription('');
      setShowNewProject(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      setProjectMenuOpen(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleStartRename = (project: Project) => {
    setEditingProject(project.id);
    setEditName(project.name);
    setProjectMenuOpen(null);
  };

  const handleRenameProject = async (projectId: string) => {
    if (!editName.trim()) return;

    try {
      await updateDoc(doc(db, 'projects', projectId), {
        name: editName.trim(),
        updatedAt: serverTimestamp(),
      });
      setEditingProject(null);
      setEditName('');
    } catch (error) {
      console.error('Error renaming project:', error);
    }
  };

  const handleCancelRename = () => {
    setEditingProject(null);
    setEditName('');
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
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="helixGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#8b5cf6', stopOpacity: 1}} />
                    </linearGradient>
                    <linearGradient id="helixGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#06b6d4', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#10b981', stopOpacity: 1}} />
                    </linearGradient>
                  </defs>
                  <path d="M15 10 Q5 30 15 50 Q25 70 15 90 Q5 110 15 120" 
                        stroke="url(#helixGradient1)" 
                        strokeWidth="3" 
                        fill="none" 
                        strokeLinecap="round"/>
                  <path d="M45 10 Q55 30 45 50 Q35 70 45 90 Q55 110 45 120" 
                        stroke="url(#helixGradient2)" 
                        strokeWidth="3" 
                        fill="none" 
                        strokeLinecap="round"/>
                  <line x1="15" y1="20" x2="45" y2="20" stroke="#3b82f6" strokeWidth="1.5" opacity="0.7"/>
                  <line x1="18" y1="30" x2="42" y2="30" stroke="#06b6d4" strokeWidth="1.5" opacity="0.7"/>
                  <line x1="15" y1="40" x2="45" y2="40" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.7"/>
                  <line x1="12" y1="50" x2="48" y2="50" stroke="#10b981" strokeWidth="1.5" opacity="0.7"/>
                  <line x1="15" y1="60" x2="45" y2="60" stroke="#3b82f6" strokeWidth="1.5" opacity="0.7"/>
                  <line x1="18" y1="70" x2="42" y2="70" stroke="#06b6d4" strokeWidth="1.5" opacity="0.7"/>
                  <line x1="15" y1="80" x2="45" y2="80" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.7"/>
                  <line x1="12" y1="90" x2="48" y2="90" stroke="#10b981" strokeWidth="1.5" opacity="0.7"/>
                  <line x1="15" y1="100" x2="45" y2="100" stroke="#3b82f6" strokeWidth="1.5" opacity="0.7"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Helix <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">IDE</span>
              </h1>
            </div>
            <span className="text-gray-400 font-medium">Welcome back, {user?.displayName || user?.email?.split('@')[0]}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowSettings(true)}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
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
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your projects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:shadow-xl transition-all duration-200 bg-gray-800/50 border-gray-700 backdrop-blur-xl hover:bg-gray-800/70 group relative animate-fade-in hover-lift">
              <CardHeader className="relative">
                <CardTitle className="flex items-center justify-between text-white group-hover:text-blue-400 transition-colors">
                  <div className="flex items-center flex-1">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3">
                      <Code className="w-4 h-4 text-white" />
                    </div>
                    {editingProject === project.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameProject(project.id);
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                        onBlur={() => handleRenameProject(project.id)}
                        className="bg-gray-700 border-gray-600 text-white text-sm h-8 mr-2"
                        autoFocus
                      />
                    ) : (
                      <span className="flex-1">{project.name}</span>
                    )}
                  </div>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectMenuOpen(projectMenuOpen === project.id ? null : project.id);
                      }}
                      className="h-8 w-8 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                    {projectMenuOpen === project.id && (
                      <div className="absolute right-0 top-8 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 min-w-36 animate-scale-in">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartRename(project);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 transition-colors rounded-t-lg flex items-center gap-2"
                        >
                          <Edit2 className="w-3 h-3" />
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-colors rounded-b-lg flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {project.description || 'No description provided'}
                </p>
                <p className="text-xs text-gray-500 mb-4 font-medium">
                  Created {project.createdAt?.toDate ? project.createdAt.toDate().toLocaleDateString() : 'Unknown'}
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
        )}
      </main>
      
      {/* Settings Modal */}
      <SettingsComponent 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}
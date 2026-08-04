import { useState, useEffect } from 'react';
import { api, getToken, setToken, clearToken } from './api';
import AuthScreen from './components/AuthScreen.jsx';
import ProjectsScreen from './components/ProjectsScreen.jsx';
import BoardScreen from './components/BoardScreen.jsx';

export default function App() {
  const [stage, setStage] = useState('loading'); // loading | setup | login | projects | board
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      const { hasPassword } = await api.authStatus();
      if (!hasPassword) {
        setStage('setup');
        return;
      }
      if (getToken()) {
        setStage('projects');
      } else {
        setStage('login');
      }
    } catch (e) {
      setStage('login');
    }
  }

  function handleAuthed(token) {
    setToken(token);
    setStage('projects');
  }

  function logout() {
    clearToken();
    setActiveProject(null);
    setStage('login');
  }

  function openProject(project) {
    setActiveProject(project);
    setStage('board');
  }

  function backToProjects() {
    setActiveProject(null);
    setStage('projects');
  }

  if (stage === 'loading') {
    return <div className="loading-text">Memuat...</div>;
  }

  if (stage === 'setup' || stage === 'login') {
    return <AuthScreen mode={stage} onAuthed={handleAuthed} />;
  }

  if (stage === 'projects') {
    return <ProjectsScreen onOpenProject={openProject} onLogout={logout} />;
  }

  if (stage === 'board' && activeProject) {
    return <BoardScreen project={activeProject} onBack={backToProjects} onLogout={logout} />;
  }

  return null;
}

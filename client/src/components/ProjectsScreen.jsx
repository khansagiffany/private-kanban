import { useState, useEffect } from 'react';
import { api } from '../api';

export default function ProjectsScreen({ onOpenProject, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (e) {
      console.error(e);
    }
    setLoaded(true);
  }

  async function createProject() {
    if (!newName.trim()) return;
    const project = await api.createProject(newName.trim());
    setProjects([...projects, project]);
    setNewName('');
    setCreating(false);
  }

  async function removeProject(e, id) {
    e.stopPropagation();
    if (!confirm('Hapus project ini beserta semua kartunya?')) return;
    await api.deleteProject(id);
    setProjects(projects.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="topbar">
        <h1 className="f-display">✨ Project Saya</h1>
        <button className="btn-ghost" onClick={onLogout}>Keluar</button>
      </div>

      {!loaded ? (
        <p className="loading-text">Memuat project...</p>
      ) : (
        <div className="projects-grid">
          {projects.map((p) => (
            <div key={p.id} className="project-card" onClick={() => onOpenProject(p)}>
              <h3>{p.name}</h3>
              <p>Dibuat {new Date(p.createdAt).toLocaleDateString('id-ID')}</p>
              <button
                onClick={(e) => removeProject(e, p.id)}
                style={{ marginTop: 10, fontSize: 11, color: '#C96060', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Hapus project
              </button>
            </div>
          ))}

          {creating ? (
            <div className="project-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                autoFocus
                className="input"
                style={{ marginBottom: 0 }}
                placeholder="Nama project"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createProject()}
              />
              <button className="btn-primary" onClick={createProject}>Buat Project</button>
            </div>
          ) : (
            <button className="project-card-new" onClick={() => setCreating(true)}>
              + Project Baru
            </button>
          )}
        </div>
      )}
    </div>
  );
}

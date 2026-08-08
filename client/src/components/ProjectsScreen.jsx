import { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import ProjectModal, { CATEGORIES, STATUSES } from './ProjectModal.jsx';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export default function ProjectsScreen({ onOpenProject, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [modalProject, setModalProject] = useState(null); // null = closed, {} = create, {...} = edit

  const [selectedMonths, setSelectedMonths] = useState(new Set());
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedStatus, setSelectedStatus] = useState('all'); // all | ongoing | done

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

  async function saveProject(form) {
    if (form.id) {
      const updated = await api.updateProject(form.id, form);
      setProjects(projects.map((p) => (p.id === form.id ? updated : p)));
    } else {
      const created = await api.createProject(form);
      setProjects([...projects, created]);
    }
    setModalProject(null);
  }

  async function removeProject(e, id) {
    e.stopPropagation();
    if (!confirm('Hapus project ini beserta semua kartunya?')) return;
    await api.deleteProject(id);
    setProjects(projects.filter((p) => p.id !== id));
  }

  // Bulan-bulan yang tersedia, dihitung dari tanggal project yang ada
  const availableMonths = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      const key = (p.date || p.createdAt || '').slice(0, 7); // YYYY-MM
      if (key) set.add(key);
    });
    return Array.from(set).sort();
  }, [projects]);

  function toggleMonth(key) {
    const next = new Set(selectedMonths);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedMonths(next);
  }
  function toggleCategory(key) {
    const next = new Set(selectedCategories);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedCategories(next);
  }

  const filteredProjects = projects.filter((p) => {
    const monthKey = (p.date || p.createdAt || '').slice(0, 7);
    const monthMatch = selectedMonths.size === 0 || selectedMonths.has(monthKey);
    const categoryMatch = selectedCategories.size === 0 || selectedCategories.has(p.category || 'project');
    const statusMatch = selectedStatus === 'all' || (p.status || 'ongoing') === selectedStatus;
    return monthMatch && categoryMatch && statusMatch;
  });

  return (
    <div>
      <div className="topbar">
        <h1 className="f-display">✨ Project Saya</h1>
        <button className="btn-ghost" onClick={onLogout}>Keluar</button>
      </div>

      {loaded && projects.length > 0 && (
        <div className="filter-bar">
          <div className="filter-group">
            <span className="filter-label">Bulan</span>
            <div className="filter-chips">
              {availableMonths.map((key) => {
                const [y, m] = key.split('-');
                const label = `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
                const active = selectedMonths.has(key);
                return (
                  <button
                    key={key}
                    className={`filter-chip${active ? ' active' : ''}`}
                    onClick={() => toggleMonth(key)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Kategori</span>
            <div className="filter-chips">
              {Object.entries(CATEGORIES).map(([key, c]) => {
                const active = selectedCategories.has(key);
                return (
                  <button
                    key={key}
                    className={`filter-chip${active ? ' active' : ''}`}
                    onClick={() => toggleCategory(key)}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Status</span>
            <div className="filter-chips">
              {['all', 'ongoing', 'done'].map((key) => (
                <button
                  key={key}
                  className={`filter-chip${selectedStatus === key ? ' active' : ''}`}
                  onClick={() => setSelectedStatus(key)}
                >
                  {key === 'all' ? 'Semua' : STATUSES[key].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loaded ? (
        <p className="loading-text">Memuat project...</p>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((p) => {
            const cat = CATEGORIES[p.category || 'project'];
            const st = STATUSES[p.status || 'ongoing'];
            return (
              <div key={p.id} className="project-card" onClick={() => onOpenProject(p)}>
                <div className="project-card-badges">
                  <span className="badge" style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
                  <span className="badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                </div>
                <h3>{p.name}</h3>
                <p>Tanggal {p.date ? new Date(p.date).toLocaleDateString('id-ID') : '-'}</p>
                {p.deadline && (
                  <p className="deadline-text">Deadline {new Date(p.deadline).toLocaleDateString('id-ID')}</p>
                )}
                <div className="project-card-actions">
                  <button
                    onClick={(e) => { e.stopPropagation(); setModalProject(p); }}
                    className="link-btn"
                  >
                    Edit
                  </button>
                  <button onClick={(e) => removeProject(e, p.id)} className="link-btn danger">
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}

          <button className="project-card-new" onClick={() => setModalProject({})}>
            + Project Baru
          </button>
        </div>
      )}

      {modalProject && (
        <ProjectModal project={modalProject.id ? modalProject : null} onSave={saveProject} onClose={() => setModalProject(null)} />
      )}
    </div>
  );
}
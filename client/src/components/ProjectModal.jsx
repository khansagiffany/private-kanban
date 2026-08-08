import { useState } from 'react';

export const CATEGORIES = {
  project: { label: 'Project', color: '#8A6FB0', bg: '#EFE6F8' },
  product: { label: 'Product', color: '#3E7FA8', bg: '#E1F0FB' },
  bau: { label: 'BAU', color: '#B9873A', bg: '#FBF0D8' },
};

export const STATUSES = {
  ongoing: { label: 'Ongoing', color: '#B9873A', bg: '#FBF0D8' },
  done: { label: 'Done', color: '#5C9A72', bg: '#E4F4E8' },
};

const today = () => new Date().toISOString().slice(0, 10);

export default function ProjectModal({ project, onSave, onClose }) {
  const [form, setForm] = useState(
    project || { name: '', date: today(), category: 'project', deadline: '', status: 'ongoing' }
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="f-display">{form.id ? 'Edit Project' : 'Project Baru'}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <input
          className="input"
          placeholder="Nama project"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <label className="field-label">Tanggal project</label>
        <input
          type="date"
          className="input"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        <label className="field-label">Kategori</label>
        <div className="priority-picker" style={{ marginBottom: 16 }}>
          {Object.entries(CATEGORIES).map(([key, c]) => (
            <button
              key={key}
              onClick={() => setForm({ ...form, category: key })}
              style={{
                background: form.category === key ? c.bg : '#F7F2FA',
                color: form.category === key ? c.color : 'var(--text-light)',
                border: form.category === key ? `1px solid ${c.color}55` : '1px solid transparent',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <label className="field-label">Deadline (opsional)</label>
        <input
          type="date"
          className="input"
          value={form.deadline || ''}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
        />

        <label className="field-label">Status</label>
        <div className="priority-picker" style={{ marginBottom: 20 }}>
          {Object.entries(STATUSES).map(([key, s]) => (
            <button
              key={key}
              onClick={() => setForm({ ...form, status: key })}
              style={{
                background: form.status === key ? s.bg : '#F7F2FA',
                color: form.status === key ? s.color : 'var(--text-light)',
                border: form.status === key ? `1px solid ${s.color}55` : '1px solid transparent',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          className="btn-primary"
          disabled={!form.name.trim()}
          style={{ opacity: form.name.trim() ? 1 : 0.5 }}
          onClick={() => onSave(form)}
        >
          Simpan
        </button>
      </div>
    </div>
  );
}
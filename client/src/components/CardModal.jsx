import { useState } from 'react';
import { PRIORITIES, STATUSES } from './BoardScreen.jsx';

export default function CardModal({ card, categories = [], onSave, onDelete, onClose }) {
  const [form, setForm] = useState(card);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="f-display">{form.id ? 'Edit Kartu' : 'Kartu Baru'}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <label className="field-label">Kategori (opsional)</label>
        <select
          className="input"
          value={form.category || ''}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">Tanpa kategori</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {categories.length === 0 && (
          <p style={{ fontSize: 11, color: 'var(--text-light)', margin: '-6px 0 12px' }}>
            Belum ada kategori — tambahin dulu lewat tombol "+ Tambah Kategori" di board.
          </p>
        )}

        <input
          className="input"
          placeholder="Judul task"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="input"
          rows={3}
          placeholder="Deskripsi (opsional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <label className="field-label">Tanggal</label>
        <input
          type="date"
          className="input"
          value={form.date || ''}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', margin: '0 0 8px' }}>Prioritas</p>
        <div className="priority-picker" style={{ marginBottom: 16 }}>
          {Object.entries(PRIORITIES).map(([key, p]) => (
            <button
              key={key}
              onClick={() => setForm({ ...form, priority: key })}
              style={{
                background: form.priority === key ? p.bg : '#F7F2FA',
                color: form.priority === key ? p.color : 'var(--text-light)',
                border: form.priority === key ? `1px solid ${p.color}55` : '1px solid transparent',
              }}
            >
              {p.label}
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

        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', margin: '0 0 8px' }}>Status</p>
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

        <div className="modal-actions">
          {form.id && (
            <button className="btn-delete" onClick={() => onDelete(form.id)}>🗑</button>
          )}
          <button
            className="btn-primary"
            style={{ opacity: form.title.trim() ? 1 : 0.5 }}
            disabled={!form.title.trim()}
            onClick={() => onSave(form)}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
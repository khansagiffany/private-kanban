import { useState } from 'react';
import { PRIORITIES } from './BoardScreen.jsx';

export default function CardModal({ card, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(card);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="f-display">{form.id ? 'Edit Kartu' : 'Kartu Baru'}</h2>
          <button onClick={onClose}>✕</button>
        </div>

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

        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', margin: '0 0 8px' }}>Prioritas</p>
        <div className="priority-picker">
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

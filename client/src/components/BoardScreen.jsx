import { useState, useEffect } from 'react';
import { api } from '../api';
import CardModal from './CardModal.jsx';

export const COLUMNS = [
  { id: 'backlog', title: 'Backlog', emoji: '📥', bg: 'var(--lavender)', border: 'var(--lavender-border)', head: 'var(--lavender-head)' },
  { id: 'requirement', title: 'Requirement Gathering', emoji: '📝', bg: 'var(--blue)', border: 'var(--blue-border)', head: 'var(--blue-head)' },
  { id: 'uiux', title: 'UI/UX', emoji: '🎨', bg: 'var(--pink)', border: 'var(--pink-border)', head: 'var(--pink-head)' },
  { id: 'review', title: 'Review PM', emoji: '🔎', bg: 'var(--peach)', border: 'var(--peach-border)', head: 'var(--peach-head)' },
  { id: 'engineer', title: 'Engineer', emoji: '⚙️', bg: 'var(--mint)', border: 'var(--mint-border)', head: 'var(--mint-head)' },
  { id: 'done', title: 'Done', emoji: '✅', bg: 'var(--butter)', border: 'var(--butter-border)', head: 'var(--butter-head)' },
];

export const PRIORITIES = {
  low: { label: 'Low', color: '#5C9A72', bg: '#E4F4E8' },
  medium: { label: 'Medium', color: '#B9873A', bg: '#FBF0D8' },
  high: { label: 'High', color: '#C96060', bg: '#FBE3E3' },
};

export default function BoardScreen({ project, onBack, onLogout }) {
  const [cards, setCards] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [modalCard, setModalCard] = useState(null);
  const [dragId, setDragId] = useState(null);

  useEffect(() => {
    load();
  }, [project.id]);

  async function load() {
    setLoaded(false);
    try {
      const data = await api.getCards(project.id);
      setCards(data);
    } catch (e) {
      console.error(e);
    }
    setLoaded(true);
  }

  async function persistOrder(next) {
    setCards(next);
    try {
      await api.reorderCards(project.id, next);
    } catch (e) {
      console.error(e);
    }
  }

  function openAddModal(columnId) {
    setModalCard({ columnId, title: '', description: '', priority: 'medium' });
  }
  function openEditModal(card) {
    setModalCard({ ...card });
  }
  function closeModal() {
    setModalCard(null);
  }

  async function saveModal(card) {
    if (!card.title.trim()) return;
    if (card.id) {
      const updated = await api.updateCard(card.id, card);
      setCards(cards.map((c) => (c.id === card.id ? updated : c)));
    } else {
      const created = await api.createCard(project.id, card);
      setCards([...cards, created]);
    }
    closeModal();
  }

  async function removeCard(id) {
    await api.deleteCard(id);
    setCards(cards.filter((c) => c.id !== id));
    closeModal();
  }

  function onDropOnCard(e, targetCard) {
    e.preventDefault();
    e.stopPropagation();
    if (!dragId || dragId === targetCard.id) return;
    const dragged = cards.find((c) => c.id === dragId);
    if (!dragged) return;
    const rest = cards.filter((c) => c.id !== dragId);
    const idx = rest.findIndex((c) => c.id === targetCard.id);
    const updated = { ...dragged, columnId: targetCard.columnId };
    rest.splice(idx, 0, updated);
    persistOrder(rest);
    setDragId(null);
  }

  function onDropOnColumn(e, columnId) {
    e.preventDefault();
    if (!dragId) return;
    const dragged = cards.find((c) => c.id === dragId);
    if (!dragged) return;
    const rest = cards.filter((c) => c.id !== dragId);
    let lastIdx = -1;
    rest.forEach((c, i) => { if (c.columnId === columnId) lastIdx = i; });
    const updated = { ...dragged, columnId };
    rest.splice(lastIdx + 1, 0, updated);
    persistOrder(rest);
    setDragId(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn-ghost" onClick={onBack}>← Project</button>
          <h1 className="f-display">✨ {project.name}</h1>
        </div>
        <button className="btn-ghost" onClick={onLogout}>Keluar</button>
      </div>

      {!loaded ? (
        <p className="loading-text">Memuat board...</p>
      ) : (
        <div className="board-scroll">
          <div className="board-row">
            {COLUMNS.map((col) => {
              const colCards = cards.filter((c) => c.columnId === col.id);
              return (
                <div
                  key={col.id}
                  className="column"
                  style={{ background: col.bg, border: `1px solid ${col.border}` }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDropOnColumn(e, col.id)}
                >
                  <div className="column-head" style={{ background: col.head }}>
                    <span>{col.emoji} {col.title}</span>
                    <span className="column-count">{colCards.length}</span>
                  </div>

                  <div className="column-body">
                    {colCards.length === 0 && <p className="column-empty">Belum ada kartu</p>}
                    {colCards.map((card) => {
                      const p = PRIORITIES[card.priority] || PRIORITIES.medium;
                      return (
                        <div
                          key={card.id}
                          className={`card${dragId === card.id ? ' dragging' : ''}`}
                          draggable
                          onDragStart={() => setDragId(card.id)}
                          onDragEnd={() => setDragId(null)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => onDropOnCard(e, card)}
                          onClick={() => openEditModal(card)}
                        >
                          <h4>{card.title}</h4>
                          {card.description && <p>{card.description}</p>}
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span className="priority-chip" style={{ background: p.bg, color: p.color }}>
                              {p.label}
                            </span>
                            <span className="project-chip">{project.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button className="add-card-btn" onClick={() => openAddModal(col.id)}>
                    + Tambah Kartu
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modalCard && (
        <CardModal card={modalCard} onSave={saveModal} onDelete={removeCard} onClose={closeModal} />
      )}
    </div>
  );
}

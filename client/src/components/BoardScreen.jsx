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

export const STATUSES = {
  ongoing: { label: 'Ongoing', color: '#B9873A', bg: '#FBF0D8' },
  done: { label: 'Done', color: '#5C9A72', bg: '#E4F4E8' },
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const today = () => new Date().toISOString().slice(0, 10);

export default function BoardScreen({ project, onBack, onLogout }) {
  const [cards, setCards] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [modalCard, setModalCard] = useState(null);
  const [dragId, setDragId] = useState(null);

  const [selectedMonths, setSelectedMonths] = useState(new Set());
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [selectedStatus, setSelectedStatus] = useState('all'); // all | ongoing | done

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

  // Semua tag unik yang pernah dipakai di kartu-kartu project ini, buat dropdown & filter
  const existingTags = Array.from(
    new Set(cards.map((c) => (c.tag || '').trim()).filter(Boolean))
  ).sort();

  function openAddModal(columnId) {
    setModalCard({
      columnId,
      title: '',
      description: '',
      priority: 'medium',
      date: today(),
      tag: '',
      deadline: '',
      status: 'ongoing',
    });
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

  const availableMonths = Array.from(
    new Set(cards.map((c) => (c.date || c.createdAt || '').slice(0, 7)).filter(Boolean))
  ).sort();

  function toggleMonth(key) {
    const next = new Set(selectedMonths);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedMonths(next);
  }
  function toggleTag(key) {
    const next = new Set(selectedTags);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedTags(next);
  }

  const filteredCards = cards.filter((c) => {
    const monthKey = (c.date || c.createdAt || '').slice(0, 7);
    const monthMatch = selectedMonths.size === 0 || selectedMonths.has(monthKey);
    const tagMatch = selectedTags.size === 0 || selectedTags.has((c.tag || '').trim());
    const statusMatch = selectedStatus === 'all' || (c.status || 'ongoing') === selectedStatus;
    return monthMatch && tagMatch && statusMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn-ghost" onClick={onBack}>← Project</button>
          <h1 className="f-display">✨ {project.name}</h1>
        </div>
        <button className="btn-ghost" onClick={onLogout}>Keluar</button>
      </div>

      {loaded && cards.length > 0 && (
        <div className="filter-bar">
          <div className="filter-group">
            <span className="filter-label">Bulan</span>
            <div className="filter-chips">
              {availableMonths.map((key) => {
                const [y, m] = key.split('-');
                const label = `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
                return (
                  <button
                    key={key}
                    className={`filter-chip${selectedMonths.has(key) ? ' active' : ''}`}
                    onClick={() => toggleMonth(key)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {existingTags.length > 0 && (
            <div className="filter-group">
              <span className="filter-label">Tag</span>
              <div className="filter-chips">
                {existingTags.map((tag) => (
                  <button
                    key={tag}
                    className={`filter-chip${selectedTags.has(tag) ? ' active' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

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
        <p className="loading-text">Memuat board...</p>
      ) : (
        <div className="board-scroll">
          <div className="board-row">
            {COLUMNS.map((col) => {
              const colCards = filteredCards.filter((c) => c.columnId === col.id);
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
                      const st = STATUSES[card.status || 'ongoing'];
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
                          <h4>
                            {card.tag && <span className="tag-prefix">[{card.tag}]</span>}
                            {card.title}
                          </h4>
                          {card.description && <p>{card.description}</p>}
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: card.deadline ? 6 : 0 }}>
                            <span className="priority-chip" style={{ background: p.bg, color: p.color }}>{p.label}</span>
                            <span className="priority-chip" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                          </div>
                          {card.deadline && (
                            <p style={{ fontSize: 11, color: '#C96060', margin: 0 }}>
                              Deadline {new Date(card.deadline).toLocaleDateString('id-ID')}
                            </p>
                          )}
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
        <CardModal card={modalCard} existingTags={existingTags} onSave={saveModal} onDelete={removeCard} onClose={closeModal} />
      )}
    </div>
  );
}
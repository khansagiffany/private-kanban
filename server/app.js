require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { readData, writeData } = require('./db');
const { signToken, requireAuth } = require('./auth');

const app = express();

app.use(cors());
app.use(express.json());

function genId(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---------- AUTH ----------

app.get('/api/auth/status', async (req, res) => {
  const data = await readData();
  res.json({ hasPassword: !!data.auth.passwordHash });
});

app.post('/api/auth/setup', async (req, res) => {
  const data = await readData();
  if (data.auth.passwordHash) {
    return res.status(400).json({ error: 'Password sudah pernah dibuat' });
  }
  const { password } = req.body;
  if (!password || password.length < 4) {
    return res.status(400).json({ error: 'Password minimal 4 karakter' });
  }
  data.auth.passwordHash = await bcrypt.hash(password, 10);
  await writeData(data);
  res.json({ token: signToken() });
});

app.post('/api/auth/login', async (req, res) => {
  const data = await readData();
  if (!data.auth.passwordHash) {
    return res.status(400).json({ error: 'Password belum diset, lakukan setup dulu' });
  }
  const { password } = req.body;
  const match = await bcrypt.compare(password || '', data.auth.passwordHash);
  if (!match) return res.status(401).json({ error: 'Password salah' });
  res.json({ token: signToken() });
});

app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  const data = await readData();
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'Password baru minimal 4 karakter' });
  }
  data.auth.passwordHash = await bcrypt.hash(newPassword, 10);
  await writeData(data);
  res.json({ ok: true });
});

// ---------- PROJECTS ----------

app.get('/api/projects', requireAuth, async (req, res) => {
  const data = await readData();
  res.json(data.projects);
});

app.post('/api/projects', requireAuth, async (req, res) => {
  const { name, date, category, deadline, status } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nama project wajib diisi' });
  const data = await readData();
  const project = {
    id: genId('p_'),
    name: name.trim(),
    date: date || new Date().toISOString().slice(0, 10),
    category: category || 'project',
    deadline: deadline || null,
    status: status || 'ongoing',
    createdAt: new Date().toISOString(),
  };
  data.projects.push(project);
  await writeData(data);
  res.json(project);
});

app.put('/api/projects/:id', requireAuth, async (req, res) => {
  const { name } = req.body;
  const data = await readData();
  const project = data.projects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project tidak ditemukan' });
  if (name && name.trim()) project.name = name.trim();
  await writeData(data);
  res.json(project);
});

app.delete('/api/projects/:id', requireAuth, async (req, res) => {
  const data = await readData();
  data.projects = data.projects.filter((p) => p.id !== req.params.id);
  data.cards = data.cards.filter((c) => c.projectId !== req.params.id);
  await writeData(data);
  res.json({ ok: true });
});

// ---------- CARDS ----------

app.get('/api/projects/:id/cards', requireAuth, async (req, res) => {
  const data = await readData();
  res.json(data.cards.filter((c) => c.projectId === req.params.id));
});

app.post('/api/projects/:id/cards', requireAuth, async (req, res) => {
  const { title, description, priority, columnId, date, category, deadline, status } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Judul kartu wajib diisi' });
  const data = await readData();
  const project = data.projects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project tidak ditemukan' });
  const card = {
    id: genId('c_'),
    projectId: req.params.id,
    columnId: columnId || 'backlog',
    title: title.trim(),
    description: description || '',
    priority: priority || 'medium',
    date: date || new Date().toISOString().slice(0, 10),
    category: category || 'project',
    deadline: deadline || null,
    status: status || 'ongoing',
    createdAt: new Date().toISOString(),
  };
  data.cards.push(card);
  await writeData(data);
  res.json(card);
});


app.put('/api/cards/:id', requireAuth, async (req, res) => {
  const data = await readData();
  const card = data.cards.find((c) => c.id === req.params.id);
  if (!card) return res.status(404).json({ error: 'Kartu tidak ditemukan' });
  const { title, description, priority, columnId, date, category, deadline, status } = req.body;
  if (title !== undefined) card.title = title;
  if (description !== undefined) card.description = description;
  if (priority !== undefined) card.priority = priority;
  if (columnId !== undefined) card.columnId = columnId;
  if (date !== undefined) card.date = date;
  if (category !== undefined) card.category = category;
  if (deadline !== undefined) card.deadline = deadline;
  if (status !== undefined) card.status = status;
  await writeData(data);
  res.json(card);
});

app.delete('/api/cards/:id', requireAuth, async (req, res) => {
  const data = await readData();
  data.cards = data.cards.filter((c) => c.id !== req.params.id);
  await writeData(data);
  res.json({ ok: true });
});

app.put('/api/projects/:id/cards/reorder', requireAuth, async (req, res) => {
  const { cards } = req.body;
  if (!Array.isArray(cards)) return res.status(400).json({ error: 'Format cards tidak valid' });
  const data = await readData();
  const otherCards = data.cards.filter((c) => c.projectId !== req.params.id);
  data.cards = [...otherCards, ...cards];
  await writeData(data);
  res.json({ ok: true });
});

module.exports = app;

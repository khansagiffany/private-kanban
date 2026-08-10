const TOKEN_KEY = 'kanban-token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
  return data;
}

export const api = {
  authStatus: () => request('/auth/status'),
  setup: (password) => request('/auth/setup', { method: 'POST', body: JSON.stringify({ password }) }),
  login: (password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),
  changePassword: (newPassword) =>
    request('/auth/change-password', { method: 'POST', body: JSON.stringify({ newPassword }) }),

  getProjects: () => request('/projects'),
  createProject: (fields) => request('/projects', { method: 'POST', body: JSON.stringify(fields) }),
  updateProject: (id, fields) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(fields) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  addCategory: (projectId, name) =>
    request(`/projects/${projectId}/categories`, { method: 'POST', body: JSON.stringify({ name }) }),

  deleteCategory: (projectId, name) =>
    request(`/projects/${projectId}/categories/${encodeURIComponent(name)}`, { method: 'DELETE' }),

  getCards: (projectId) => request(`/projects/${projectId}/cards`),
  createCard: (projectId, card) =>
    request(`/projects/${projectId}/cards`, { method: 'POST', body: JSON.stringify(card) }),
  updateCard: (id, card) => request(`/cards/${id}`, { method: 'PUT', body: JSON.stringify(card) }),
  deleteCard: (id) => request(`/cards/${id}`, { method: 'DELETE' }),
  reorderCards: (projectId, cards) =>
    request(`/projects/${projectId}/cards/reorder`, { method: 'PUT', body: JSON.stringify({ cards }) }),
};

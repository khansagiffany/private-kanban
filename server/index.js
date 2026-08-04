const path = require('path');
const express = require('express');
const app = require('./app');

const PORT = process.env.PORT || 4000;

// Serve the built frontend (only used for self-hosted / non-Vercel deployment)
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Private Kanban server jalan di http://localhost:${PORT}`);
});

const app = require('./app');
const { initDatabase } = require('./config/dbInit');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`Health: http://localhost:${PORT}/api/health`);

  // Auto-create tables and seed data if database is empty
  try {
    await initDatabase();
  } catch (e) {
    console.error('[Server] DB init failed:', e.message);
  }

  // Pre-warm book search index (non-blocking, won't crash if DB is down)
  try {
    const { loadChunks } = require('./services/documentSearch');
    console.log('[Server] Building book search index...');
    await loadChunks();
    console.log('[Server] Book search index ready');
  } catch (e) {
    console.error('[Server] Search index build skipped:', e.message);
  }
});

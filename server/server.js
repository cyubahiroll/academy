const app = require('./app');
const { loadChunks } = require('./services/documentSearch');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`Health: http://localhost:${PORT}/api/health`);

  // Pre-warm book search index for fast responses
  console.log('[Server] Building book search index...');
  loadChunks().then(() => {
    console.log('[Server] Book search index ready');
  }).catch(e => {
    console.error('[Server] Failed to build search index:', e.message);
  });
});

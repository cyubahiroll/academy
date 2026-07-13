process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err.message);
  console.error(err.stack);
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled Rejection:', reason);
});

let app;
try {
  app = require('./app');
  console.log('[Server] App loaded successfully');
} catch (err) {
  console.error('[FATAL] Failed to load app:', err.message);
  console.error(err.stack);
  process.exit(1);
}

const { initDatabase } = require('./config/dbInit');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`[Server] Running on port ${PORT}`);

  try {
    await initDatabase();
  } catch (e) {
    console.error('[Server] DB init failed:', e.message);
  }

  try {
    const { loadChunks } = require('./services/documentSearch');
    console.log('[Server] Building book search index...');
    await loadChunks();
    console.log('[Server] Book search index ready');
  } catch (e) {
    console.error('[Server] Search index build skipped:', e.message);
  }
});

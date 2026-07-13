const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const examRoutes = require('./routes/examRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const videoRoutes = require('./routes/videoRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const booksRoutes = require('./routes/booksRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const freeTestRoutes = require('./routes/freeTestRoutes');
const aiQuestionRoutes = require('./routes/aiQuestionRoutes');
const aiChatRoutes = require('./routes/aiChatRoutes');
const aiAnswerRoutes = require('./routes/aiAnswerRoutes');
const teamMemberRoutes = require('./routes/teamMemberRoutes');

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'https://roadrulesacademy.vercel.app'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Only serve non-sensitive uploads publicly; documents are served through protected routes
app.use('/uploads/profile', express.static(path.join(__dirname, 'uploads', 'profile')));
app.use('/uploads/certificates', express.static(path.join(__dirname, 'uploads', 'certificates')));
app.use('/uploads/videos', express.static(path.join(__dirname, 'uploads', 'videos')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/free-test', freeTestRoutes);
app.use('/api/ai-questions', aiQuestionRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/ai', aiAnswerRoutes);
app.use('/api/team', teamMemberRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

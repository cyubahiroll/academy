# Road Rules Academy

A comprehensive online learning platform for mastering road traffic rules, signs, and driving exam preparation. Built with React + Vite frontend and Node.js + Express backend.

## Features

- **Road Signs Library** - Browse categorized road signs with descriptions
- **Video Lessons** - Stream educational driving videos
- **Free Quizzes** - Practice with 3 attempts per quiz
- **Premium Exams** - Timed certification exams with detailed results
- **Subscription Plans** - Monthly, Quarterly, and Yearly premium access
- **Payment Integration** - MTN MoMo, Airtel Money, and Visa/Mastercard (Stripe)
- **Certificate Generation** - PDF certificates upon exam completion
- **Leaderboard** - Rankings and competitive scoring
- **AI-Powered Assistance** - Chat with AI tutor, auto-generate questions, and solve problems
- **Multi-language Support** - English, French, Kinyarwanda, and Swahili
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Admin Dashboard** - Manage users, videos, library, and team members

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JWT, Google OAuth |
| Payments | MTN MoMo, Airtel Money, Stripe |
| AI | Groq (Llama 3) |
| Deployment | Vercel (frontend), Node.js host (backend) |

## Project Structure

```
academy/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API service functions
│   │   ├── routes/         # Route definitions
│   │   ├── layouts/        # Layout components
│   │   ├── i18n/           # Internationalization
│   │   ├── styles/         # Global styles
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Node.js + Express Backend
│   ├── config/             # Database, multer, payment config
│   ├── controllers/        # Route handlers
│   ├── middleware/          # Auth, error, upload middleware
│   ├── models/             # Data models and business logic
│   ├── routes/             # API route definitions
│   ├── services/           # External service integrations
│   ├── utils/              # Utility functions
│   ├── data/               # JSON data files
│   ├── uploads/            # User-uploaded files
│   ├── package.json
│   └── server.js
│
├── database/               # SQL schema and seed data
├── docs/                   # Documentation
├── .gitignore
├── LICENSE
├── README.md
└── package.json            # Root scripts
```

## Installation

### Prerequisites

- Node.js v18+
- MySQL (XAMPP or standalone)
- npm

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/cyubahiroll/academy.git
cd academy
```

2. **Install all dependencies**
```bash
npm run install:all
```

3. **Database setup**
   - Start MySQL (XAMPP or standalone)
   - Create a database named `road_rules`
   - Import the schema: `database/road_rules.sql`
   - Import sample data: `database/seed.sql`

4. **Configure environment variables**
```bash
# Copy and edit server environment variables
cp server/.env.example server/.env
# Edit server/.env with your database credentials and API keys
```

5. **Run the application**
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

## Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run client` | Start only the frontend (Vite dev server) |
| `npm run server:dev` | Start only the backend (with nodemon) |
| `npm run build` | Build the frontend for production |
| `npm run seed` | Seed the database with sample data |
| `npm run install:all` | Install dependencies for root, server, and client |

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | - |
| `DB_NAME` | Database name | `road_rules` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `AI_API_KEY` | Groq API key | - |
| `STRIPE_SECRET_KEY` | Stripe secret key | - |
| `EMAIL_USER` | SMTP email | - |
| `EMAIL_PASS` | SMTP password | - |

See `server/.env.example` for the complete list.

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `VITE_API_URL` | Backend API URL (optional, uses proxy in dev) |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Quizzes & Exams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes` | List quizzes |
| POST | `/api/quizzes/:id/start` | Start a quiz |
| POST | `/api/quizzes/:id/submit` | Submit quiz answers |
| GET | `/api/exams` | List exams |
| POST | `/api/exams/:id/start` | Start an exam |
| POST | `/api/exams/:id/submit` | Submit exam answers |
| GET | `/api/free-test` | Free practice tests |

### Content
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/videos` | List videos |
| GET | `/api/library` | List documents |
| GET | `/api/books` | List books |

### User Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Create payment |
| GET | `/api/leaderboard` | View leaderboard |
| GET | `/api/certificates/my` | My certificates |
| POST | `/api/ai-chat` | Chat with AI tutor |
| POST | `/api/ai-questions` | Generate AI questions |

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Connect repository to Vercel
3. Set build command: `cd client && npm install && npm run build`
4. Set output directory: `client/dist`
5. Add environment variables in Vercel dashboard

### Backend (Render / Railway / VPS)

1. Set environment variables on your hosting platform
2. Ensure MySQL database is accessible
3. Run `npm start` as the start command
4. The server will start on the configured `PORT`

## License

MIT

## Author

**cyubahiroll** - [GitHub](https://github.com/cyubahiroll)

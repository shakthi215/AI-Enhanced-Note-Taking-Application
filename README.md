# AI Notes - Your AI Thinking Companion

A full-stack AI-powered smart note-taking system built with React, Node.js, MongoDB Atlas, and Claude AI.

---

## 🚀 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router, Recharts  |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB Atlas                     |
| AI        | Anthropic Claude (claude-opus-4-5)|
| Auth      | JWT (JSON Web Tokens)             |
| Styling   | Custom CSS (dark theme)           |

---

## ✨ Features

- 🔐 **Authentication** – Register/login with JWT
- ✍️ **Smart Note Creation** – Full markdown editor
- 🧠 **AI Enhancement** – Grammar, clarity, expansion
- 📋 **AI Summarization** – Summary, bullet points, highlights
- 🏷️ **Auto-Tagging** – AI detects tags & categories
- 🔍 **Semantic Search** – Natural language note search
- 💡 **AI Suggestions** – Ideas, improvements, missing points
- 🤖 **Chat with Notes** – Ask AI about any note
- 📚 **Flashcards** – AI-generated Q&A cards
- 🧾 **Auto Formatting** – Convert to structured markdown
- 📊 **Dashboard Analytics** – Charts, trends, insights
- 📌 Pin, Archive, Export notes
- 🎨 Note color coding

---

## 📁 Project Structure

```
ai-notes/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── noteController.js
│   │   ├── aiController.js
│   │   └── dashboardController.js
│   ├── models/
│   │   ├── User.js
│   │   └── Note.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── notes.js
│   │   ├── ai.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/
│   │   │   │   └── AIPanel.js
│   │   │   ├── notes/
│   │   │   │   ├── NotesList.js
│   │   │   │   └── NoteEditor.js
│   │   │   └── shared/
│   │   │       └── Sidebar.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── NotesContext.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── NotesPage.js
│   │   │   └── SettingsPage.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── package.json
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Anthropic API key

---

### 1. Clone / Extract the project

```bash
cd ai-notes
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/neuronotes
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=development
```

Install dependencies & run:
```bash
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Install & run:
```bash
npm install
npm start
```

---

### 4. Run Both Together (from root)

```bash
npm install          # installs concurrently
npm run install:all  # installs backend + frontend deps
npm run dev          # runs both servers
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## Deployment

### Frontend on Vercel

Deploy the `frontend` folder as a separate Vercel project.

Build settings:

- Framework Preset: `Create React App`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `build`

Environment variable:

```env
REACT_APP_API_URL=https://your-render-service.onrender.com/api
```

Notes:

- `frontend/vercel.json` is included so React Router routes like `/dashboard` and `/notes` resolve correctly after refresh.
- After the first backend deploy, copy the Render service URL into `REACT_APP_API_URL` and redeploy Vercel.

### Backend on Render

Deploy the `backend` folder as a Node web service on Render.

If you use `render.yaml`, Render can pick up these settings automatically:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Required backend environment variables:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai-notes
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=7d
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
CLIENT_URL=https://your-vercel-project.vercel.app
NODE_ENV=production
PORT=10000
```

Notes:

- `backend/server.js` now accepts `CLIENT_URL` or a comma-separated `CLIENT_URLS` list for CORS, which is useful if you want to allow both your Vercel production URL and a local frontend.
- After deploying Vercel, update Render with your exact frontend URL so authenticated API requests are accepted.

### Recommended deployment order

1. Deploy the backend to Render.
2. Copy the Render URL into Vercel as `REACT_APP_API_URL`.
3. Deploy the frontend to Vercel.
4. Copy the Vercel URL into Render as `CLIENT_URL`.
5. Redeploy Render once so CORS matches the live frontend.

Useful docs:

- Vercel CRA docs: https://vercel.com/docs/frameworks/create-react-app
- Vercel build config docs: https://vercel.com/docs/builds/configure-a-build
- Render web services docs: https://render.com/docs/web-services
- Render deploy docs: https://render.com/docs/deploys/

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| POST   | /api/auth/register    | Register user       |
| POST   | /api/auth/login       | Login user          |
| GET    | /api/auth/me          | Get current user    |
| PUT    | /api/auth/preferences | Update preferences  |

### Notes
| Method | Endpoint         | Description         |
|--------|------------------|---------------------|
| GET    | /api/notes       | Get all notes       |
| GET    | /api/notes/:id   | Get single note     |
| POST   | /api/notes       | Create note         |
| PUT    | /api/notes/:id   | Update note         |
| DELETE | /api/notes/:id   | Delete note         |
| GET    | /api/notes/search| Search notes        |

### AI
| Method | Endpoint                | Description           |
|--------|-------------------------|-----------------------|
| POST   | /api/ai/enhance         | Enhance writing       |
| POST   | /api/ai/summarize       | Summarize note        |
| POST   | /api/ai/tag             | Auto-tag note         |
| POST   | /api/ai/suggestions     | Get AI suggestions    |
| POST   | /api/ai/format          | Format note           |
| POST   | /api/ai/chat            | Chat with note        |
| POST   | /api/ai/flashcards      | Generate flashcards   |
| POST   | /api/ai/process-all     | Full AI processing    |
| POST   | /api/ai/semantic-search | Semantic search       |

### Dashboard
| Method | Endpoint                 | Description     |
|--------|--------------------------|-----------------|
| GET    | /api/dashboard/insights  | Get analytics   |

---

## 🛡️ MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create a database user (username + password)
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Click "Connect" → "Connect your application"
6. Copy the connection string and paste in `.env` as `MONGO_URI`

---

## 🤖 Anthropic API Setup

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add to `.env` as `ANTHROPIC_API_KEY`

---

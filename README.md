# AI Notes - Your AI Thinking Companion

A full-stack AI-powered smart note-taking system built with React, Node.js, MongoDB Atlas, and Claude AI.

Url : [AI Enhanced Notes Taking Application](https://ai-enhanced-note-taking-application.vercel.app/)

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
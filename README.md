# 📧 Sendwave — AI-Powered Cold Email Outreach Platform

Sendwave is a full-stack cold email outreach platform that automates multi-step email sequences, detects replies, and uses a RAG (Retrieval-Augmented Generation) pipeline to send intelligent AI-generated responses — all powered by real-world technologies used in production SaaS products.

---

## 🚀 Live Demo

> Coming soon — deployment in progress

---

## ✨ Features

- **Google OAuth2** — One-click Gmail account connection using OAuth2 + XOAUTH2 IMAP authentication (no app passwords)
- **Multi-step Email Sequences** — Create campaigns with multiple follow-up steps, custom delays, and send schedules
- **RAG Auto-Reply Pipeline** — Automatically replies to leads using a knowledge base stored in Pinecone vector database
- **Zero-shot Email Classification** — Classifies replies into categories (Interested, Not Interested, Spam, Confused) using `facebook/bart-large-mnli`
- **Automatic Sequence Stopping** — Stops follow-up emails when a lead replies negatively
- **BullMQ Job Queues** — Scalable email sending with retry logic and concurrency control
- **Algolia Full-text Search** — All emails indexed and searchable with campaign/category metadata
- **Campaign Analytics** — Track sent, replied, opted-out stats per campaign
- **Lead Management** — Upload leads via CSV or raw email list

---

## 🧠 RAG Pipeline

The AI auto-reply system uses a full RAG pipeline:

```
User adds knowledge base snippets (e.g. "Book a demo at calendly.com/...")
        ↓
HuggingFace embeds text → vectors stored in Pinecone with campaignId
        ↓
Lead replies to campaign email
        ↓
Reply text embedded → Pinecone queried for top 3 relevant snippets
        ↓
Groq LLM (llama-3.1-8b-instant) generates context-aware reply
        ↓
Reply sent automatically via SMTP OAuth2
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Frontend                        │
│          React + TypeScript + Vite                  │
└────────────────────┬────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────┐
│                     Backend                         │
│           Node.js + Express + TypeScript            │
├─────────────────────────────────────────────────────┤
│  BullMQ Workers  │  Cron Jobs  │  IMAP Polling      │
└──┬───────────────┴──────┬──────┴──────────┬─────────┘
   │                      │                 │
┌──▼──────┐  ┌────────────▼──┐  ┌──────────▼────────┐
│ MongoDB │  │ Upstash Redis │  │   Gmail IMAP      │
│ (data)  │  │  (BullMQ)     │  │  (ImapFlow)       │
└─────────┘  └───────────────┘  └───────────────────┘
   │
┌──▼──────────────────────────────────────────────────┐
│               External Services                     │
├────────────┬──────────────┬────────────┬────────────┤
│  Pinecone  │  HuggingFace │   Groq     │  Algolia   │
│ (vectors)  │ (embeddings) │  (LLM)     │  (search)  │
└────────────┴──────────────┴────────────┴────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB + Mongoose |
| Queue | BullMQ + Upstash Redis |
| Search | Algolia |
| Vector DB | Pinecone |
| Embeddings | HuggingFace Inference API (`all-MiniLM-L6-v2`) |
| LLM | Groq (`llama-3.1-8b-instant`) |
| Classification | HuggingFace (`facebook/bart-large-mnli`) |
| Email Auth | Google OAuth2 + XOAUTH2 |
| Email Sending | Nodemailer (OAuth2 SMTP) |
| Email Polling | ImapFlow |
| Auth | JWT + HTTP-only cookies |

---

## 📁 Project Structure

```
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/           # Campaign, Hub, Auth pages
│   │   ├── components/      # Reusable UI components
│   │   ├── services/        # API service functions
│   │   └── context/         # React context (accounts, auth)
│
└── server/                  # Node.js backend
    ├── src/
    │   ├── models/          # Mongoose models
    │   ├── controllers/     # Route controllers
    │   ├── routes/          # Express routes
    │   ├── services/        # Business logic
    │   ├── workers/         # BullMQ workers
    │   ├── jobs/            # Cron jobs
    │   ├── ai/              # HuggingFace classification
    │   ├── config/          # DB, Redis, Pinecone, Algolia clients
    │   └── utility/         # IMAP, encryption, helpers
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- MongoDB
- Upstash Redis account
- Pinecone account
- Algolia account
- HuggingFace account
- Groq API key
- Google Cloud Console project with OAuth2 credentials

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/sendwave.git
cd sendwave

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Variables

Create a `.env` file in `/server`:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGO_URI=your_mongodb_uri

# JWT
JWT_SECRET=your_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

# Upstash Redis
UPSTASH_REDIS_URL=your_upstash_url
UPSTASH_REDIS_TOKEN=your_upstash_token

# Pinecone
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=your_index_name

# HuggingFace
HUGGINGFACE_API_KEY=your_hf_key

# Groq
GROQ_API_KEY=your_groq_key

# Algolia
ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_ADMIN_KEY=your_algolia_admin_key
```

### Running the App

```bash
# Start backend
cd server
npm run dev

# Start frontend
cd client
npm run dev
```

---

## 📬 How It Works

### 1. Connect Gmail
Click "Connect Gmail" → Google OAuth2 flow → tokens stored securely in MongoDB → IMAP/SMTP authenticated via XOAUTH2.

### 2. Create a Campaign
- Add a name and select your Gmail account
- Add AI context snippets to your knowledge base (stored in Pinecone)
- Build your email sequence (Step 1, Step 2, follow-ups with delays)
- Upload leads via CSV or paste emails directly
- Set your send schedule

### 3. Launch
Campaign goes active → BullMQ queues emails → sends at scheduled time.

### 4. Auto-Reply
Lead replies → IMAP cron detects it → classified by AI → if positive, RAG pipeline generates reply using your knowledge base → sent automatically.

---

## 🔑 Key Engineering Decisions

- **OAuth2 over App Passwords** — More secure, better UX, no manual setup for users
- **RAG over static templates** — Context-aware replies instead of hardcoded responses
- **HuggingFace API over local models** — Avoids Node.js heap memory issues from loading ML models in-process
- **BullMQ for email sending** — Retry logic, concurrency control, job persistence
- **Algolia for email search** — Fast full-text search with filtering by campaign, category, folder
- **Hardcoded categories** — Zero-shot classification with fixed labels ensures consistent behavior without user configuration

---

## 📄 License

MIT

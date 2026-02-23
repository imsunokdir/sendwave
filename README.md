# Sendwave

A full-stack cold email outreach platform built with React, Node.js, and MongoDB. Sendwave lets you connect your email accounts, build multi-step sequences, and automate your entire outreach pipeline — from sending to reply detection to AI-powered responses.

## Features

- **Multi-account email sending** — connect multiple Gmail or Outlook accounts via OAuth and app passwords
- **Campaign sequencer** — build multi-step email sequences with configurable delays and send schedules
- **Automatic reply detection** — background cron polls for replies and updates lead status in real time
- **AI-powered smart replies** — uses Groq LLM to draft or auto-send replies to interested leads
- **Email classification** — HuggingFace models automatically categorize incoming replies (interested, not interested, out of office, etc.)
- **Lead management** — upload leads via CSV or raw text, paginated table with status filtering
- **Live dashboard** — reply rate, lead funnel donut chart, recent replies, and campaign health at a glance
- **AI context system** — attach context snippets (pricing, booking links, key points) that the AI references when generating replies

## Tech Stack

**Frontend:** React, TypeScript, Vite, React Router, Recharts  
**Backend:** Node.js, Express, TypeScript, MongoDB, BullMQ  
**Queue / Cache:** Upstash Redis  
**AI:** Groq (smart reply generation)  
**ML:** HuggingFace (email classification + embeddings)  
**Vector DB:** Pinecone (stores and searches context embeddings)  
**Search:** Algolia  
**Email:** Nodemailer, IMAP, Gmail OAuth, Google Pub/Sub  
**Infrastructure:** Docker

## Getting Started

```bash
# Clone the repo
git clone https://github.com/yourname/sendwave.git
cd sendwave

# Start everything with Docker
docker compose up --build
```

Client runs on `http://localhost:5173`  
Server runs on `http://localhost:5000`

## Environment Variables

Copy `.env.example` to `server/.env` and fill in your keys:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `GROQ_API_KEY` | Groq API key for smart replies |
| `HUGGINGFACE_API_TOKEN` | HuggingFace token for classification |
| `PINECONE_API_KEY` | Pinecone vector DB key |
| `ALGOLIA_APP_ID` | Algolia app ID |
| `ALGOLIA_ADMIN_KEY` | Algolia admin key |
| `JWT_ACCESS_SECRET` | JWT secret for access tokens |
| `JWT_REFRESH_SECRET` | JWT secret for refresh tokens |

## Project Structure

```
sendwave/
  client/        # React frontend
  server/        # Node.js backend
    src/
      controller/   # Route handlers
      models/       # Mongoose schemas
      routes/       # Express routes
      services/     # Business logic
      queues/       # BullMQ workers
      cron/         # Reply detection cron jobs
```

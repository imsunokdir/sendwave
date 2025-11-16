
**Description:**  
1. **IMAP Email Accounts:** Real-time syncing via persistent connections.  
2. **Backend API:** Node.js + TypeScript handles email fetching, indexing, and AI categorization.  
3. **Elasticsearch:** Stores emails for fast search and filtering by folder/account.  
4. **ChromaDB:** Vector database for RAG embeddings used in suggested replies.  
5. **Gemini AI:** Performs email categorization and generates context-aware suggested replies.  
6. **Frontend UI:** React app served via Nginx to display emails, search, and show AI categorization.  
7. **Slack/Webhook:** Notifications triggered for "Interested" emails.

---

## Features Implemented

1. **Real-Time Email Synchronization**  
   - Syncs multiple IMAP accounts  
   - Fetches last 30 days of emails  
   - Persistent IMAP connections (IDLE mode)

2. **Searchable Storage (Elasticsearch)**  
   - Stores emails with folder/account filters  
   - Supports full-text search across all emails

3. **AI-Based Email Categorization (Gemini)**  
   - Categories: Interested, Meeting Booked, Not Interested, Spam, Out of Office  

4. **Slack & Webhook Integration**  
   - Sends Slack notifications for “Interested” emails  
   - Triggers external webhook (Webhook.site)  

5. **Frontend Interface (React + Nginx)**  
   - Display emails, filter by folder/account  
   - Show AI categorization  
   - Search emails via Elasticsearch  

6. **RAG-Based Suggested Replies (Gemini)**  
   - Uses ChromaDB embeddings + Gemini to suggest replies based on outreach data  

---

## Setup Instructions

### Prerequisites
- Docker & Docker Compose installed  
- `.env` file with email credentials, API keys, and URLs  

### Environment Variables (`server/.env`)


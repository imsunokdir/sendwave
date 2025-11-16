
**Project video:** [Download Here](https://drive.google.com/file/d/1cTRKk1MhmGXvYER2D2hDj_hDKsZmDRci/view?usp=sharing)

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

6. **RAG-Based Suggested Replies (pincone)**  
   - Pinecone stores vectors & performs similarity search
   - Gemini uses retrieved context to generate reply suggestions
   - Gemini generates the embeddings
   - Produces dynamic, personalized outreach replies

---

## Setup Instructions

**For simplicity, users currently need to hard-code email and app password in the .env file. Only 2 email accounts max are supported at this stage.**

### Prerequisites
- Docker & Docker Compose installed  
- `.env` file with email credentials, API keys, and URLs  

### Environment Variables (`server/.env`)

## Future Plans

- **Dynamic Email Integration:** Add a feature to dynamically add new email accounts (Gmail, Yahoo, Outlook, etc.) without restarting the service.  
- **Email Sending:** Implement sending emails directly from Onebox after generating suggested replies.  
- **Advanced Categorization:** Support custom categories and multi-language emails.  
- **User Management:** Add login system for multiple users with separate accounts and preferences.  
- **Analytics Dashboard:** Show stats like number of emails per category, reply rates, and engagement metrics.  
- **Optimized Hosting:** Deploy Elasticsearch and ChromaDB efficiently on cloud for production use.  
- **Improved UI/UX:** Add notifications, real-time updates on frontend, and responsive design for mobile devices.  



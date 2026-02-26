FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Compile TypeScript to JavaScript
RUN npx tsc

# ── Production stage ──────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled JS from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "--max-old-space-size=4096", "dist/server.js"]
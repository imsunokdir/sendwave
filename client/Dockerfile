FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# ← Add these 3 lines
ARG VITE_BASE_URL=http://localhost:5000
ENV VITE_BASE_URL=$VITE_BASE_URL
RUN echo "VITE_BASE_URL is: $VITE_BASE_URL"

RUN npm run build

# ── Production stage — nginx serves static files ──
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Handle React Router (client-side routing)
RUN echo 'server { \
  listen 80; \
  location / { \
    root /usr/share/nginx/html; \
    index index.html; \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
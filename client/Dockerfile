FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 5173

# Vite needs --host to be accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]
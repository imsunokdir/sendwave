# Stage 1: Build
FROM node:20-bullseye AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc -p tsconfig.build.json

# Stage 2: Production
FROM node:20-bullseye

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm install --production

EXPOSE 5000
CMD ["node", "dist/server.js"]

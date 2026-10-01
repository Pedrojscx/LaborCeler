FROM node:24-bookworm-slim

WORKDIR /app

# Sem NODE_ENV=production: as devDependencies são necessárias para "npm test" no container.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

USER node

EXPOSE 3000

CMD ["node", "src/server.js"]

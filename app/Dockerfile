FROM node:24-bookworm-slim

WORKDIR /app

# Sem NODE_ENV=production: as devDependencies são necessárias para "npm test" no container.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Pasta do segredo da sessão gerado na primeira subida (volume segredo_sessao), com dono node
# para o app gravar o arquivo; só RUN, compatível com o builder clássico (research R4 da 002).
RUN mkdir -p /app/segredo && chown node:node /app/segredo

USER node

EXPOSE 3000

CMD ["node", "src/server.js"]

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
RUN npm install
COPY . .
RUN npx prisma generate --schema=packages/api/prisma/schema.prisma
RUN npm run build:api

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/api/prisma ./packages/api/prisma

EXPOSE 3001
ENV PORT=3001
CMD ["node", "packages/api/dist/main.js"]

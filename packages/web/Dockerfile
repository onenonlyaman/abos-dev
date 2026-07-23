FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/web/package*.json ./packages/web/
RUN npm install
COPY . .
RUN npm run build:web

FROM node:22-alpine AS runner
WORKDIR /app
COPY package*.json ./
COPY packages/web/package*.json ./packages/web/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/web/.next ./packages/web/.next
COPY --from=builder /app/packages/web/package.json ./packages/web/package.json

EXPOSE 3010
ENV PORT=3010
ENV HOSTNAME="0.0.0.0"
CMD ["npx", "next", "start", "-w", "packages/web", "-H", "0.0.0.0", "-p", "3010"]

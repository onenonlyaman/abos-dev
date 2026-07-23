FROM node:22-alpine AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
RUN npm install
COPY . .
RUN npx prisma generate --schema=packages/api/prisma/schema.prisma
RUN npm run build:api

FROM node:22-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app/packages/api
COPY package*.json /app/
COPY packages/api/package*.json /app/packages/api/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages/api/dist /app/packages/api/dist
COPY --from=builder /app/packages/api/prisma /app/packages/api/prisma

EXPOSE 3001
ENV PORT=3001
CMD ["sh", "-c", "npx prisma db push --schema=prisma/schema.prisma && (npx prisma db seed || true) && (node dist/src/main.js || node dist/main.js)"]

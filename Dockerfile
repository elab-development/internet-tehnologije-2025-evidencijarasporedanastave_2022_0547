# 1. FAZA: Instalacija zavisnosti
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# 2. FAZA: Build aplikacije
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Isključujemo proveru tipova i linting tokom build-a da bi prošlo brže (opciono)
ENV NEXT_TELEMETRY_DISABLED 1
RUN NEXT_TELEMETRY_DISABLED=1 npx next build --no-lint

# 3. FAZA: Finalna produkciona slika
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Kreiranje korisnika radi bezbednosti
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopiranje neophodnih standalone fajlova
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
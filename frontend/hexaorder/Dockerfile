# ============================================================
# STAGE 1 — BUILD
# Node.js builds the Vite/React app into static files
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (layer cache)
COPY package.json package-lock.json ./

# Install ALL deps (including devDependencies needed by Vite)
RUN npm ci --frozen-lockfile

# Copy source code
COPY . .

# Build for production — outputs to /app/dist
# VITE_API_BASE_URL is injected at build time via docker-compose build args
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ============================================================
# STAGE 2 — RUNTIME
# Nginx serves the static dist/ files and proxies /api → backend
# ============================================================
FROM nginx:1.27-alpine AS runtime

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy the built React app
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx listens on 80 inside the container
EXPOSE 80

# Use exec form so signals reach Nginx (clean shutdown)
CMD ["nginx", "-g", "daemon off;"]
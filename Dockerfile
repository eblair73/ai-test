# Multi-stage Docker build for AI Test Application

# Build stage for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production

COPY frontend/ ./
RUN npm run build

# Build stage for backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./

# Build stage for Rust devops tools
FROM rust:1.88-alpine AS devops-builder

RUN apk add --no-cache musl-dev openssl-dev

WORKDIR /app/devops
COPY devops/Cargo.toml devops/Cargo.lock ./
RUN cargo fetch

COPY devops/src ./src
RUN cargo build --release

# Final runtime stage
FROM node:20-alpine AS runtime

RUN apk add --no-cache openssl ca-certificates

WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend ./backend
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules

# Copy built frontend
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules

# Copy devops tools
COPY --from=devops-builder /app/devops/target/release/ai-test-devops ./devops/

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'cd /app/backend && npm start &' >> /app/start.sh && \
    echo 'cd /app/frontend && npm start &' >> /app/start.sh && \
    echo 'wait' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 3000 3001

CMD ["/app/start.sh"]
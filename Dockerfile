# ---- Build stage: compile the Vite/React app to static assets ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies (cached unless package files change).
COPY package.json package-lock.json* ./
RUN npm install

# Build the production bundle.
COPY . .
RUN npm run build

# ---- Serve stage: static files via nginx ----
FROM nginx:1.27-alpine AS serve
# SPA-aware nginx config (history fallback to index.html).
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

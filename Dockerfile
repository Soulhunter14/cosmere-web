# Build stage: runs on the builder's own platform (amd64 on the dev PC), never
# under QEMU emulation. The output (dist/) is static files, so it is the same
# for every target platform.
FROM --platform=$BUILDPLATFORM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage: built for the target platform (linux/arm64 on the server).
# No RUN here, so the target platform never needs emulation.
FROM nginx:alpine AS runtime

COPY --from=build /app/dist /var/www/cosmere-web
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

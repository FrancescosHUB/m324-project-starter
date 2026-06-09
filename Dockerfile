# Stage 1: Lint, Test und Build
FROM node:20 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run lint
RUN npm run test
RUN npm run build

# Stage 2: Produktion
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/client ./client
COPY --from=build /app/package.json .
CMD ["node", "build/index.js"]

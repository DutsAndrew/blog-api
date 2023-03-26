# Build stage
FROM node:16.13.2-alpine AS build
WORKDIR /usr/app
COPY package*.json ./
COPY tsconfig.json ./
COPY ./*.ts ./
RUN npm ci
RUN npx tsc
COPY ./dist ./dist

# Production stage
FROM node:16.13.2-alpine
WORKDIR /usr/app
COPY package*.json ./
COPY --from=build /usr/app/dist ./dist
RUN npm ci --production
COPY . .
EXPOSE 8080
CMD [ "node", "dist/app.js" ]
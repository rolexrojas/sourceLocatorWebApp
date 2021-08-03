# Stage 1

FROM node:14-alpine as build-step

RUN mkdir -p /app

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

EXPOSE 4200

RUN npm run build

FROM nginx:1.17.1-alpine

COPY --from=build-step /app/dist/sourceLocatorWebApp /usr/share/nginx/html
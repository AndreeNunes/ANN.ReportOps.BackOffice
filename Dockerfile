# -------- STAGE 1: BUILD --------
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install -g @quasar/cli@2.0.0 --silent
COPY . .
RUN npm install --silent
RUN ENV_TYPE=prd quasar build

FROM nginx:stable-alpine
COPY --from=build /app/dist/spa /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
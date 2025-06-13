# Step 1: 使用 Node 建構 React 專案
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Step 2: 使用 Nginx 服務前端
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

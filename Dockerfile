# Базовый образ для сборки
FROM node:18-alpine AS builder

# Установка рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Сборка проекта
RUN npm run build

# Базовый образ для production
FROM nginx:alpine

# Копирование собранных файлов из builder в nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Копирование конфига nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открытие порта 80
EXPOSE 80

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]
# 🚀 Деплой Flower Shop в Dokploy

## 📋 Предварительные требования

- Dokploy установлен и настроен
- Доступ к GitHub репозиторию
- Домен или поддомен для проекта

## 🔧 Шаги деплоя

### 1. Создание проекта в Dokploy

1. Откройте Dokploy Dashboard
2. Нажмите **"Create Application"**
3. Выберите **"Dockerfile"** как Build Type
4. Заполните форму:
   - **Name**: `flower-shop`
   - **Repository**: `https://github.com/virpom/flower-production.git`
   - **Branch**: `main`
   - **Build Path**: `/`
   - **Dockerfile**: `Dockerfile`

### 2. Настройка переменных окружения

В разделе **Environment Variables** добавьте:

```bash
NODE_ENV=production
MONGODB_URI=mongodb://floweradmin:flowerpassword@flower-mongodb:27017/flowerdb?authSource=admin
JWT_SECRET=b7e715694c65e315219213192452b43a9030a528625e19a4843b381517865268
NEXT_PUBLIC_APP_URL=https://ваш-домен.traefik.me
NEXT_PUBLIC_API_URL=https://ваш-домен.traefik.me/api
NEXT_TELEMETRY_DISABLED=1
```

### 3. Создание MongoDB сервиса

1. Создайте новый **Service**
2. Выберите **MongoDB** из шаблонов
3. Настройте:
   - **Name**: `flower-mongodb`
   - **Username**: `floweradmin`
   - **Password**: `flowerpassword`
   - **Database**: `flowerdb`
   - **Port**: `27017`

### 4. Создание Mongo Express (опционально)

1. Создайте новый **Service**
2. Выберите **Mongo Express**
3. Настройте:
   - **Name**: `flower-mongo-express`
   - **MongoDB URL**: `mongodb://floweradmin:flowerpassword@flower-mongodb:27017/`
   - **Basic Auth Username**: `admin`
   - **Basic Auth Password**: `admin123`

### 5. Настройка доменов

1. В настройках приложения перейдите в **Domains**
2. Добавьте домен (например: `flower.ваш-домен.com`)
3. Настройте SSL сертификат

### 6. Деплой

1. Нажмите **"Deploy"**
2. Ждите завершения сборки
3. Проверьте логи на наличие ошибок

### 7. Создание админ пользователя

После успешного деплоя:

1. Зайдите в терминал контейнера приложения
2. Выполните: `npm run create-admin`
3. Или: `node create-admin.js`

## 🔐 Доступ к системе

- **Сайт**: https://ваш-домен.traefik.me
- **Админ панель**: https://ваш-домен.traefik.me/auth/login
- **Mongo Express**: https://mongo-express.ваш-домен.traefik.me

### Учетные данные

**Админ панель:**
- Логин: `admin`
- Пароль: `admin123`

**Mongo Express:**
- Логин: `admin`
- Пароль: `admin123`

## 🐛 Troubleshooting

### Проблема с подключением к MongoDB

Если приложение не может подключиться к MongoDB:

1. Проверьте, что MongoDB сервис запущен
2. Убедитесь, что переменная `MONGODB_URI` содержит правильное имя контейнера
3. Проверьте сеть между контейнерами

### Ошибки при сборке

1. Проверьте логи сборки в Dokploy
2. Убедитесь, что все зависимости установлены
3. Проверьте синтаксис Dockerfile

### Проблемы с доменом

1. Убедитесь, что домен корректно настроен в DNS
2. Проверьте настройки Traefik
3. Убедитесь, что SSL сертификат выпущен

## 📁 Структура проекта

```
flower-production/
├── app/                 # Next.js app directory
├── lib/                 # Утилиты и подключения
├── models/              # Mongoose модели
├── public/              # Статические файлы
├── Dockerfile           # Docker конфигурация
├── docker-compose.yml   # Compose для локальной разработки
├── next.config.js       # Next.js конфигурация
└── package.json         # Зависимости
```

## 🔄 Обновление

Для обновления приложения:

1. Запушьте изменения в GitHub
2. В Dokploy нажмите **"Redeploy"**
3. Ждите завершения сборки

## 📊 Мониторинг

Dokploy предоставляет:
- Логи контейнеров в реальном времени
- Метрики использования ресурсов
- Статус здоровья сервисов
- Уведомления о проблемах

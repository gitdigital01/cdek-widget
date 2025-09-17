# CDEK Widget на DockHost (single container: Nginx + PHP-FPM)

Готовый проект для деплоя на **DockHost** с использованием Docker-образа. Образ внутри запускает nginx и php-fpm (через supervisord), отдаёт фронт и `service.php` на одном домене — идеально для Telegram WebApp.

## Быстрый старт на DockHost

1. **Подготовка проекта:**
   - Замените `app/php/service_core.php` на **официальный** совместимый файл из CDEK Widget 3.x
   - Вставьте свой **Yandex Maps JS API key** в `app/public/config.json` (ограничьте по Referrer)
   - Настройте учетные данные CDEK в `app/php/service_core.php`

2. **Деплой на DockHost:**
   - Загрузите проект в Git репозиторий (GitHub, GitLab, Bitbucket)
   - В панели DockHost создайте новый проект
   - Подключите ваш репозиторий
   - DockHost автоматически обнаружит `Dockerfile` и соберет образ
   - Настройте переменные окружения:
     - `ALLOWED_ORIGIN=https://<ваш-домен>.dockhost.ru`
     - `CDEK_USE_TEST_API=true` (для тестирования)
     - (опционально) `CDEK_ACCOUNT`, `CDEK_KEY`

3. **Настройка Telegram Bot:**
   - Укажите URL вашего приложения DockHost в BotFather как WebApp URL
   - Протестируйте работу виджета

## Структура проекта

```
├── Dockerfile               # Docker образ для DockHost
├── app/
│   ├── public/              # Фронтенд (HTML, CSS, JS)
│   │   ├── index.html
│   │   ├── script.js
│   │   ├── style.css
│   │   └── config.json
│   └── php/
│       └── service_core.php # PHP сервис для CDEK API
└── docker/
    └── nginx-php/           # Конфигурации nginx и supervisord
        ├── nginx.conf.template
        ├── supervisord.conf
        └── entrypoint.sh
```

## Особенности

- **Один контейнер**: nginx + php-fpm работают в одном контейнере через supervisord
- **CORS поддержка**: автоматическая настройка CORS заголовков
- **Telegram WebApp**: полная поддержка Telegram WebApp SDK
- **CDEK Widget v3**: интеграция с официальным виджетом СДЭК
- **DockHost оптимизация**: настроен специально для платформы DockHost

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `PORT` | Порт для веб-сервера | `8080` |
| `ALLOWED_ORIGIN` | Разрешенные домены для CORS | `*` |
| `CDEK_USE_TEST_API` | Использовать тестовый API CDEK | `false` |
| `CDEK_ACCOUNT` | Учетные данные CDEK (логин) | - |
| `CDEK_KEY` | Учетные данные CDEK (пароль) | - |

Удачи! 🚀

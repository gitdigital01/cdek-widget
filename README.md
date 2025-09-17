# CDEK Widget на Amvera (single container: Nginx + PHP-FPM)

Готовый проект для деплоя на **Amvera** с использованием Docker-образа. Образ внутри запускает nginx и php-fpm (через supervisord), отдаёт фронт и `service.php` на одном домене — идеально для Telegram WebApp.

## Конфигурация Amvera

Проект настроен для работы с Amvera через файл `amvera.yaml`:

```yaml
meta:
  environment: php
  toolchain:
    name: php
    version: 8.2

build:
  packages:
    - nginx
    - supervisor
    - curl
    - gettext
  php_extensions:
    - bcmath

run:
  command: ["supervisord", "-c", "/etc/supervisord.conf"]
  port: 8080
  env:
    PORT: "8080"
    ALLOWED_ORIGIN: "*"
```

## Быстрый старт на Amvera

1. **Подготовка проекта:**
   - Замените `app/php/service_core.php` на **официальный** совместимый файл из CDEK Widget 3.x
   - Вставьте свой **Yandex Maps JS API key** в `app/public/config.json` (ограничьте по Referrer)
   - Настройте учетные данные CDEK в `app/php/service_core.php`

2. **Деплой на Amvera:**
   - Загрузите проект в Git репозиторий (GitHub, GitLab, Bitbucket)
   - В панели Amvera создайте новое приложение
   - Подключите ваш репозиторий
   - Amvera автоматически обнаружит `amvera.yaml` и `Dockerfile`
   - Настройте переменные окружения:
     - `ALLOWED_ORIGIN=https://<ваш-домен>.amvera.ru`
     - `CDEK_USE_TEST_API=true` (для тестирования)
     - (опционально) `CDEK_ACCOUNT`, `CDEK_KEY`

3. **Настройка Telegram Bot:**
   - Укажите URL вашего приложения Amvera в BotFather как WebApp URL
   - Протестируйте работу виджета

## Структура проекта

```
├── amvera.yaml              # Конфигурация для Amvera
├── Dockerfile               # Docker образ для Amvera
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
- **Amvera оптимизация**: настроен специально для платформы Amvera

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `PORT` | Порт для веб-сервера | `8080` |
| `ALLOWED_ORIGIN` | Разрешенные домены для CORS | `*` |
| `CDEK_USE_TEST_API` | Использовать тестовый API CDEK | `false` |
| `CDEK_ACCOUNT` | Учетные данные CDEK (логин) | - |
| `CDEK_KEY` | Учетные данные CDEK (пароль) | - |

Удачи! 🚀

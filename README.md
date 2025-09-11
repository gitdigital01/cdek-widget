# CDEK Widget on Koyeb (single container: Nginx + PHP-FPM)

Готовый проект для деплоя одного Docker-образа на **Koyeb**. Образ внутри запускает nginx и php-fpm (через supervisord), отдаёт фронт и `service.php` на одном домене — идеально для Telegram WebApp.

## Быстрый старт
1. Замените `app/php/service_core.php` на **официальный** совместимый файл из CDEK Widget 3.x.
2. Вставьте свой **Yandex Maps JS API key** в `app/public/config.json` (ограничьте по Referrer).
3. Запушьте в GitHub. Workflow соберёт образ: `ghcr.io/<owner>/cdek-nginx-php:latest`.
4. В Koyeb → *Create service → Deploy Docker image* → укажите образ.
5. Env vars в Koyeb:
   - `ALLOWED_ORIGIN=https://<ваш-сервис>.koyeb.app`
   - `CDEK_USE_TEST_API=true`
   - (опц.) `CDEK_ACCOUNT`, `CDEK_KEY`
6. Укажите URL Koyeb в BotFather как WebApp.

Удачи! 🚀

FROM php:8.2-fpm-alpine

RUN apk add --no-cache nginx supervisor curl gettext && \
    docker-php-ext-install bcmath

# PHP-FPM слушает TCP:9000
RUN sed -ri 's|^listen = .*|listen = 127.0.0.1:9000|' /usr/local/etc/php-fpm.d/zz-docker.conf

WORKDIR /var/www/html

# Кладём фронт ИЗ корня контекста
COPY app/public/ /var/www/html/

# ВАРИАНТ A (рекомендуется): core-файл лежит в репо
# Если используешь ВАРИАНТ B (качать по URL) — УДАЛИ этот файл из репо или закомментируй строку COPY ниже
COPY app/php/service_core.php /var/www/html/service_core.php

# ВАРИАНТ B: подтянуть core при сборке, если файла нет
ARG SERVICE_CORE_URL=""
RUN if [ ! -s "/var/www/html/service_core.php" ] && [ -n "$SERVICE_CORE_URL" ]; then \
      echo "Downloading service_core.php from $SERVICE_CORE_URL"; \
      curl -fsSL "$SERVICE_CORE_URL" -o /var/www/html/service_core.php || exit 1; \
    fi

# ВАЖНО: пути к файлам тоже из корня контекста
COPY docker/nginx-php/nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY docker/nginx-php/supervisord.conf   /etc/supervisord.conf
COPY docker/nginx-php/entrypoint.sh      /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
CMD ["supervisord","-c","/etc/supervisord.conf"]


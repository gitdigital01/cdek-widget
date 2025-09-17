FROM php:8.2-fpm-alpine

# Установка необходимых пакетов
RUN apk add --no-cache nginx supervisor curl gettext && \
    docker-php-ext-install bcmath

# Настройка PHP-FPM для работы с nginx
RUN sed -ri 's|^listen = .*|listen = 127.0.0.1:9000|' /usr/local/etc/php-fpm.d/zz-docker.conf

# Рабочая директория
WORKDIR /var/www/html

# Копирование файлов приложения
COPY app/public/ /var/www/html/
COPY app/php/service_core.php /var/www/html/service_core.php

# Копирование конфигурационных файлов
COPY docker/nginx-php/nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY docker/nginx-php/supervisord.conf /etc/supervisord.conf
COPY docker/nginx-php/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Переменные окружения
ENV PORT=8080
ENV ALLOWED_ORIGIN=*

# Открытие порта
EXPOSE 8080

# Точка входа
ENTRYPOINT ["/entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]

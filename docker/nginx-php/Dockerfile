FROM php:8.2-fpm-alpine

RUN apk add --no-cache nginx supervisor curl gettext &&     docker-php-ext-install bcmath

# PHP-FPM listen on TCP for simplicity
RUN sed -ri 's|^listen = .*|listen = 127.0.0.1:9000|' /usr/local/etc/php-fpm.d/zz-docker.conf

WORKDIR /var/www/html

# Copy frontend
COPY ../../app/public/ /var/www/html/

# Preferred: copy official core from repo into the image (replace placeholder):
COPY ../../app/php/service_core.php /var/www/html/service_core.php

# Alternative: build arg to fetch core from URL at build time (if not copied)
ARG SERVICE_CORE_URL=""
RUN if [ ! -s "/var/www/html/service_core.php" ] && [ -n "$SERVICE_CORE_URL" ]; then       echo "Downloading service_core.php from $SERVICE_CORE_URL";       curl -fsSL "$SERVICE_CORE_URL" -o /var/www/html/service_core.php || true;     fi

COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY supervisord.conf /etc/supervisord.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=8080

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
CMD ["supervisord","-c","/etc/supervisord.conf"]

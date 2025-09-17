#!/usr/bin/env sh
set -e

echo "Starting entrypoint script..."

# Alpine nginx использует /etc/nginx/http.d/*.conf
NGX_DIR="/etc/nginx/http.d"
mkdir -p "$NGX_DIR"

echo "Created nginx directory: $NGX_DIR"

# Рендерим конфиг из шаблона с учётом $PORT (Amvera его задаёт)
echo "Rendering nginx config with PORT=$PORT"
envsubst '${PORT}' < /etc/nginx/templates/nginx.conf.template > "${NGX_DIR}/default.conf"

echo "Nginx config created:"
cat "${NGX_DIR}/default.conf"

# Проверяем содержимое рабочей директории
echo "Contents of /var/www/html:"
ls -la /var/www/html/

# Проверяем, что nginx конфиг валидный
echo "Testing nginx configuration..."
nginx -t

# Проверяем права доступа
echo "Checking permissions:"
ls -la /var/www/html/index.html

# CORS-обёртка для service.php
cat > /var/www/html/service.php <<'PHPWRAP'
<?php
$origin = getenv('ALLOWED_ORIGIN') ?: '*';
header("Access-Control-Allow-Origin: $origin");
header('Vary: Origin');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$core = __DIR__ . '/service_core.php';
if (!is_file($core)) {
    http_response_code(500);
    echo "service_core.php not found. Put the official compatible file next to service.php or build with SERVICE_CORE_URL";
    exit;
}
require_once $core;
PHPWRAP

echo "Entrypoint script completed. Starting supervisord..."
exec "$@"


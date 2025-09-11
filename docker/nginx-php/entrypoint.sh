#!/usr/bin/env sh
set -e

# Alpine nginx использует /etc/nginx/http.d/*.conf
NGX_DIR="/etc/nginx/http.d"
mkdir -p "$NGX_DIR"

# Рендерим конфиг из шаблона с учётом $PORT (Koyeb его задаёт)
envsubst '${PORT}' < /etc/nginx/templates/nginx.conf.template > "${NGX_DIR}/default.conf"

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

exec "$@"


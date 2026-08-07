# Managed by scripts/deploy-production.sh — HTTP entry (Certbot adds TLS).
# Placeholders: __DOMAIN__, __SERVER_NAMES__, __WEB_PORT__, __API_PORT__

upstream quranpilot_web {
    server 127.0.0.1:__WEB_PORT__;
    keepalive 32;
}

upstream quranpilot_api {
    server 127.0.0.1:__API_PORT__;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name __SERVER_NAMES__;

    client_max_body_size 20m;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type "text/plain";
        try_files $uri =404;
    }

    # Backend API + audio + Stripe webhook
    location /api/ {
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        proxy_read_timeout 120s;
        proxy_pass http://quranpilot_api/api/;
    }

    # Next.js frontend
    location / {
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 120s;
        proxy_pass http://quranpilot_web;
    }
}

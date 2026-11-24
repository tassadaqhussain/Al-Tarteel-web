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

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/xml image/svg+xml;

    client_max_body_size 20m;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type "text/plain";
        try_files $uri =404;
    }

    # Serve robots.txt directly from static dir when present (fast, immune to Node restarts),
    # falling back to Next.js /robots.txt if not yet provisioned.
    location = /robots.txt {
        root /var/www/quranpilot-static;
        add_header Cache-Control "public, max-age=3600";
        try_files /robots.txt @quranpilot_web;
    }

    # Single-hop 301 for /surah and /surah/ (avoids Next.js trailing-slash 308 hop)
    location ~ ^/surah/?$ {
        return 301 https://$host/surahs;
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

    location @quranpilot_web {
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        proxy_read_timeout 120s;
        proxy_pass http://quranpilot_web;
    }

    # Next.js frontend
    location / {
        if ($qp_invalid_next_action) {
            return 400;
        }
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

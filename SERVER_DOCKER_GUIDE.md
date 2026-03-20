# BoligOverblik Docker Guide

Kør fra `/srv/apps/BoligOverblik`.

Valider konfiguration:

```bash
docker compose -f docker-compose.local.yml --env-file .env.localhost config
```

Deploy eller opdater:

```bash
docker compose -f docker-compose.local.yml --env-file .env.localhost up -d --build
```

Status:

```bash
docker compose -f docker-compose.local.yml --env-file .env.localhost ps
docker compose -f docker-compose.local.yml --env-file .env.localhost logs --tail=100
```

Stop:

```bash
docker compose -f docker-compose.local.yml --env-file .env.localhost down
```

Standardport:

- `APP_PORT=8082`

Database:

- Lokal Postgres bruges som standard
- Schema pushes automatisk ved app-start
- Sæt `DATABASE_URL` i `.env.localhost`, hvis appen skal pege på Replit/Neon i stedet

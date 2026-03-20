# BoligOverblik

Lokal serveropsætning til BoligOverblik under `/srv/apps/BoligOverblik`.

Appen kører som:

- `app`: Node/Express + Vite build på port `5000` inde i containeren
- `postgres`: lokal PostgreSQL 16 med persistent data i `./data/postgres`

Schemaet oprettes automatisk ved containerstart via `drizzle-kit push`.

Standardadgang lokalt:

- URL: `http://localhost:8082`
- Admin-login: `admin / AL2bedst`
- Bruger-login: `AL2bolig / AL2bedst`

Hvis du vil genbruge den gamle Replit/Neon-database, så sæt `DATABASE_URL` i `.env.localhost` til den connection string og redeploy appen.

# Muelle

Encomiendas con NestJS. El estado solo avanza `recibida → en_ruta → entregada`. Cada avance publica un evento, dispara webhooks firmados con HMAC y avisa por WebSocket a quien esté siguiendo el envío.

## Qué cubre del stack

| Pieza | Dónde |
| --- | --- |
| NATS | `src/bus/nats-bus.ts`, activo con `NATS_URL`. Sin esa variable usa un bus en proceso. |
| Webhooks | `src/webhook/despachador.ts`, header `x-anden-firma`. |
| Gateway | `src/tracking/tracking.gateway.ts`, evento `seguir`. |
| PostgreSQL | `src/persistence/postgres.ts`, `POSTGRES_URL`. |
| Mongo | `src/persistence/mongo.ts`, bitácora de entregas, `MONGO_URL`. |
| SQLite | Adaptador por defecto, `node:sqlite`, el que corren las pruebas. |
| Docker y Compose | `Dockerfile`, `docker-compose.yml` (API, NATS, Postgres, Mongo). |
| Kubernetes | `k8s/deployment.yaml`. El mapa completo del clúster está en `projects/k8s-anden`. |
| GCloud | `cloudbuild.yaml`. |
| CI | el workflow del monorepo corre `npm test`. |
| Git submodule | `contracts/` es el contrato de eventos. Para separarlo: `git submodule add git@github.com:TU_USUARIO/muelle-contracts.git projects/nest-muelle/contracts`. |

## Correr

```bash
cd projects/nest-muelle
npm install
npm test
npm start
```

Escucha en el puerto `3041`.

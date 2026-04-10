# Price API

API NestJS con documentacion Swagger y proteccion por `api key`.

## Configuracion

La API usa el header `x-api-key` para proteger endpoints.

Variables disponibles:

```bash
PORT=3000
API_KEY=local-dev-api-key
```

Si no definis `API_KEY`, la app usa `local-dev-api-key` por defecto para desarrollo local.

## Levantar el proyecto

```bash
npm install
npm run start:dev
```

## Swagger

La documentacion queda disponible en:

```text
http://localhost:3000/docs
```

En Swagger podes usar el boton `Authorize` y cargar la `api key`.

## Endpoints de ejemplo

```text
GET /health   -> publico
GET /         -> protegido con x-api-key
```

Ejemplo:

```bash
curl http://localhost:3000/health
curl -H "x-api-key: local-dev-api-key" http://localhost:3000/
```

## Tests

```bash
npm run test:e2e
```
# price-api

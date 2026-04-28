# 🚀 Log Pipeline — Plataforma de Observabilidad en Tiempo Real

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![React](https://img.shields.io/badge/React-Dashboard-61dafb)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Metrics-blue)
![Redis](https://img.shields.io/badge/Redis-Streaming-red)

Pipeline completo de ingestión, procesamiento, monitorización y visualización de logs en tiempo real, inspirado en conceptos utilizados en plataformas como Datadog, ELK y herramientas modernas de observabilidad.

Proyecto de ingeniería de observabilidad inspirado en conceptos de Datadog / ELK.

![Dashboard Demo](docs/Animation.gif)

---

## 📌 Descripción

Este proyecto simula una plataforma de observabilidad end-to-end capaz de:

- Ingerir eventos vía API REST
- Procesar logs en tiempo real con Redis Pub/Sub
- Agregar métricas por ventanas temporales
- Detectar anomalías automáticamente
- Generar alertas y eventos de recuperación
- Visualizar salud del sistema mediante dashboard interactivo
- Consumir eventos en vivo vía WebSocket

Más que una API CRUD, el objetivo fue construir un proyecto orientado a ingeniería backend y pensamiento sistémico.

---

# 🧠 Arquitectura

```text
Cliente
  ↓
FastAPI (/logs)
  ↓
Redis Pub/Sub
  ↓
+---------------------+
|                     |
↓                     ↓
Log Worker        Alert Worker
|                     |
↓                     ↓
PostgreSQL        Alertas
  ↓
FastAPI (/metrics + websocket)
  ↓
Dashboard React en tiempo real
```

---

# ⚙️ Stack Tecnológico

## Backend

- FastAPI
- Python
- SQLAlchemy
- PostgreSQL
- Redis
- Alembic

## Frontend

- React
- Recharts
- WebSockets

## Infraestructura

- Docker / Docker Compose
- Render
- GitHub

---

# 📊 Funcionalidades

## Dashboard de Observabilidad

Incluye monitorización en tiempo real de:

- Total de eventos
- Volumen de errores
- Latencia media
- Error rate
- Disponibilidad (uptime)
- Estado del sistema (Healthy / Warning / Critical)
- Endpoints más lentos
- Evolución temporal de errores y latencia
- Umbral SLO e indicadores de incidente

---

## Agregación de Métricas

Los logs se procesan y agregan por minuto para generar:

- Volumen de peticiones
- Conteo de errores
- Error rate
- Latencias agregadas
- Ranking de rendimiento por endpoint

Filtros soportados:

- Ventanas temporales
- Endpoint específico

---

## Sistema de Alertas

Worker dedicado para detección automática de anomalías:

- Alertas por error rate crítico
- Eventos de recuperación automática
- Cooldown para evitar alertas duplicadas

---

## Streaming en Vivo

Actualización vía WebSocket de:

- Nuevos eventos
- Alertas activas
- Eventos de recuperación

Sin refresco de página.

---

# 🔄 Flujo de Datos

1. Cliente envía un log a `/logs`
2. Redis publica el evento
3. Worker consume y agrega métricas
4. Alert worker evalúa umbrales
5. PostgreSQL persiste métricas
6. Frontend consulta `/metrics`
7. WebSocket transmite eventos en vivo

---

# 🧪 Generación de Tráfico de Prueba

El repositorio incluye simulador para probar el pipeline completo en local:

```bash
python scripts/demo_generate_logs.py
```

Permite simular:

- Tráfico normal
- Errores 4xx / 5xx
- Picos de latencia
- Escenarios para disparar alertas
- Datos para poblar el dashboard

Útil para validar comportamiento end-to-end del sistema.

---

# ▶️ Ejecución Local

## Backend

```bash
uvicorn main:app --reload
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Docker (opcional)

```bash
docker compose up --build
```

---

# 🌐 Demo

### Frontend Dashboard

https://log-pipeline-dashboard.onrender.com

### API

https://log-pipeline-api.onrender.com

---

# 🛠 Qué demuestra este proyecto

Este proyecto pone foco en:

- Arquitectura orientada a eventos
- Procesamiento con workers en background
- Observabilidad y monitorización
- Integración API + WebSockets
- Diseño backend más allá de CRUD
- Patrones de fiabilidad e incident response

---

# 🛡 Validación de Fiabilidad

Validado bajo escenarios reales de fallo y recuperación:

- Recuperación tras cold starts en Render free tier
- Auto-reconexión de WebSocket tras wake-up del backend
- Recuperación automática del dashboard tras suspensión del servicio
- Simulación de incidentes mediante tráfico sintético
- Validación de alertas y recovery events
- Smoke tests y pruebas de resiliencia end-to-end

**Validated against Render free-tier cold starts and WebSocket auto-recovery.**

El proyecto fue probado explícitamente para seguir funcionando incluso tras suspensión por inactividad del backend.

---

# 🎯 Objetivo del Proyecto

Construir algo más cercano a ingeniería backend real que un proyecto típico de APIs.

Conceptos trabajados:

- Streaming de datos
- Métricas operacionales
- Alerting
- Señales de fiabilidad
- Visualización en tiempo real

En esencia, una versión simplificada de una plataforma de observabilidad.

---

# 🔭 Mejoras Futuras

- Exportación estilo Prometheus
- Integración OpenTelemetry
- Kafka en lugar de Redis Pub/Sub
- Dashboards multi-tenant
- Integración Grafana
- Despliegue en Kubernetes

---

## Estado del proyecto

Proyecto completado como portfolio backend/observability.

Features core, comportamiento resiliente y despliegue quedan considerados cerrados.

Cambios futuros serían evolutivos.

---

## Autor

Marcial Godes


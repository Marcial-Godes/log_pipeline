# 🚀 Log Pipeline — Monitorización en tiempo real

Sistema completo de ingesta, procesamiento y visualización de logs en tiempo real, con generación de métricas agregadas, alertas automáticas y dashboard interactivo.

---

## 📌 Descripción

Este proyecto implementa un pipeline de observabilidad inspirado en herramientas como Datadog o ELK, permitiendo:

- Ingesta de logs vía API
- Procesamiento asíncrono con Redis
- Agregación de métricas por minuto
- Detección de anomalías (errores / latencia)
- Visualización en tiempo real (WebSocket)
- Dashboard interactivo

---

## 🧠 Arquitectura

Cliente → FastAPI (/logs)
        ↓
      Redis (pub/sub)
        ↓
   Worker (procesamiento)
        ↓
 PostgreSQL (metrics_aggregated)
        ↓
   FastAPI (/metrics)
        ↓
 React Dashboard + WebSocket

---

## ⚙️ Tecnologías

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- Redis
- Alembic

### Frontend
- React
- Recharts
- WebSockets

### Infraestructura
- Docker
- Render (deploy)

---

## 🔄 Flujo de datos

1. El cliente envía logs a `/logs`
2. Los logs se publican en Redis
3. El worker consume los eventos:
   - agrega métricas por minuto
   - detecta errores y latencia alta
4. Se guardan métricas en PostgreSQL
5. El frontend consulta `/metrics`
6. WebSocket envía eventos en tiempo real

---

## ▶️ Ejecución en local

### Backend

cd app
uvicorn app.main:app --reload

### Frontend

cd frontend
npm install
npm run dev

---

## 🌐 Demo

Deploy en Render:
- API: https://logs-api-ull9.onrender.com
- Frontend: https://log-pipeline-viff.onrender.com

---

## 📊 Funcionalidades

- Métricas en tiempo real
- Detección de errores
- Alertas automáticas
- Visualización interactiva
- WebSocket en vivo

---

## 📌 Estado del proyecto

Proyecto funcional en producción con mejoras continuas enfocadas a observabilidad y escalabilidad.

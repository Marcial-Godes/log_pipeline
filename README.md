# 📊 Log Pipeline Dashboard

Sistema completo de procesamiento y visualización de logs en tiempo
real.

------------------------------------------------------------------------

## 🚀 Demo

(Pendiente de deploy)

------------------------------------------------------------------------

## 🧠 Descripción

Este proyecto implementa una arquitectura desacoplada para procesar
logs:

-   API recibe eventos
-   Redis actúa como cola
-   Worker procesa logs en background
-   PostgreSQL almacena los datos
-   Dashboard muestra métricas en tiempo real

------------------------------------------------------------------------

## 🧱 Arquitectura

Cliente → FastAPI → Redis → Worker → PostgreSQL → React Dashboard

------------------------------------------------------------------------

## 📁 Estructura del proyecto

    log_pipeline/
    │
    ├── app/
    │   ├── api/
    │   │   └── routes/
    │   │       ├── logs.py
    │   │       └── analytics.py
    │   │
    │   ├── core/
    │   │   ├── database.py
    │   │   ├── redis_client.py
    │   │   └── start.sh
    │   │
    │   ├── models/
    │   │   └── log.py
    │   │
    │   ├── schemas/
    │   │   └── log.py
    │   │
    │   ├── services/
    │   │   └── ingestion.py
    │   │
    │   └── main.py
    │
    ├── worker.py
    ├── docker-compose.yml
    ├── requirements.txt
    ├── .env
    │
    ├── scripts/
    │   └── generate_logs.py
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── App.jsx
    │   │   ├── main.jsx
    │   │   └── index.css
    │   │
    │   ├── index.html
    │   ├── package.json
    │   └── tailwind.config.js
    │
    └── README.md

------------------------------------------------------------------------

## ⚙️ Tecnologías

### Backend

-   FastAPI
-   SQLAlchemy
-   PostgreSQL
-   Redis
-   Alembic

### Frontend

-   React
-   TailwindCSS
-   Recharts

### Infraestructura

-   Docker
-   Docker Compose

------------------------------------------------------------------------

## 📊 Features

-   Dashboard en tiempo real
-   Filtros dinámicos por endpoint y status
-   Gráficas (errores vs éxito)
-   Top endpoints
-   Procesamiento asíncrono con worker

------------------------------------------------------------------------

## 🧪 Ejemplo de log

``` json
{
  "endpoint": "/login",
  "method": "POST",
  "status_code": 500
}
```

------------------------------------------------------------------------

## 🛠️ Ejecutar en local

### Backend

``` bash
docker-compose up --build
```

### Frontend

``` bash
cd frontend
npm install
npm run dev
```

------------------------------------------------------------------------

## 📌 Aprendizajes

-   Arquitectura backend desacoplada
-   Uso de Redis como cola
-   Procesamiento asíncrono con workers
-   Visualización de datos en tiempo real
-   Dockerización de servicios

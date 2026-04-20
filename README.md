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
    ├── alembic/
    │       ├── versions/
    │       │       │
    │       │       ├── 9e745339ac7e_create_raw_logs_table.py X
    │       │       │
    │       │       └── 7904eb293603_add_user_agent_to_raw_logs.py X
    │       │
    │       ├── env.py X
    │       │
    │       │
    │       └── script.py.mako X
    │
    ├── app/
    │     ├── api/
    │     │     │
    │     │     └── routes/
    │     │             │
    │     │             ├── analytics.py X
    │     │             │
    │     │             ├── logs.py X
    │     │             │
    │     │             └──metrics.py X
    │     │
    │     ├── core/
    │     │     │
    │     │     ├── database.py X
    │     │     │
    │     │     ├── redis_client.py X
    │     │     │
    │     │     └── start.sh X
    │     │
    │     ├── metrics/
    │     │       │
    │     │       └── metrics.py X
    │     │
    │     ├── middleware/
    │     │       │
    │     │       └── rate_limit.py x
    │     │
    │     ├── models/
    │     │       │
    │     │       └── log.py X
    │     │
    │     ├── schemas/
    │     │       │
    │     │       └── log.py X
    │     │
    │     ├── services/
    │     │       │
    │     │       └── analytics.py x
    │     │
    │     ├── websocket/
    │     │       │
    │     │       └── manager.py x
    │     │
    │     └── main.py x
    │     
    ├── cli/
    │     │
    │     ├── ingest.py x
    │     │
    │     └── stream.py x
    │
    ├── frontend/
    │       │
    │       ├── src/
    │       │     ├── assets/ x
    │       │     │
    │       │     ├── App.css x
    │       │     │
    │       │     ├── App.jsx x
    │       │     │
    │       │     ├── index.css x
    │       │     │
    │       │     └── main.jsx x
    │       │
    │       ├── eslint.config.js x
    │       │
    │       └── index.html X
    │           
    ├── scripts/
    │     │
    │     └── generate_logs.py x
    │
    ├── .env 
    │
    ├── .gitignore 
    │
    ├── alembic.ini 
    │
    ├── check_db.py 
    │
    ├── docker-compose.yml 
    │
    ├── Dockerfile 
    │
    ├── logs.json 
    │
    ├── README.md
    │
    ├── requirements.txt
    │
    └── worker.py


log_pipeline/
    └── frontend/
           │
           ├── dist/
           │
           ├── node_modules/
           │
           ├── public/
           │
           ├── src/
           │     ├── assets/
           │     │
           │     ├── App.css
           │     │
           │     ├── App.jsx
           │     │
           │     ├── index.css
           │     │
           │     └── main.jsx
           │
           ├── .gitignore
           │
           ├── eslint.config.js
           │
           └── index.html


C:\Users\mazin\Desktop\Python\log_pipeline\alembic\env.py
C:\Users\mazin\Desktop\Python\log_pipeline\alembic\script.py.mako
C:\Users\mazin\Desktop\Python\log_pipeline\app\api\routes\alerts.py
C:\Users\mazin\Desktop\Python\log_pipeline\app\api\routes\analytics.py
C:\Users\mazin\Desktop\Python\log_pipeline\app\api\routes\logs.py
C:\Users\mazin\Desktop\Python\log_pipeline\app\api\routes\metrics.py
C:\Users\mazin\Desktop\Python\log_pipeline\app\core\database.py
C:\Users\mazin\Desktop\Python\log_pipeline\app\core\redis_client.py
C:\Users\mazin\Desktop\Python\log_pipeline\app\core\start.sh
C:\Users\mazin\Desktop\Python\log_pipeline\app\middleware\rate_limit.py:
C:\Users\mazin\Desktop\Python\log_pipeline\app\models\alert.py:
C:\Users\mazin\Desktop\Python\log_pipeline\app\models\log.py:
C:\Users\mazin\Desktop\Python\log_pipeline\app\schemas\log.py:
C:\Users\mazin\Desktop\Python\log_pipeline\app\services\analytics.py:
C:\Users\mazin\Desktop\Python\log_pipeline\app\websocket\manager.py:
C:\Users\mazin\Desktop\Python\log_pipeline\app\main.py:
C:\Users\mazin\Desktop\Python\log_pipeline\cli\stream.py:
C:\Users\mazin\Desktop\Python\log_pipeline\frontend\src\App.css:
C:\Users\mazin\Desktop\Python\log_pipeline\frontend\src\App.jsx:
C:\Users\mazin\Desktop\Python\log_pipeline\frontend\src\index.css:
C:\Users\mazin\Desktop\Python\log_pipeline\scripts\generate_logs.py:
C:\Users\mazin\Desktop\Python\log_pipeline\scripts\generate_logs_ok.py:
C:\Users\mazin\Desktop\Python\log_pipeline\.env:
C:\Users\mazin\Desktop\Python\log_pipeline\.gitignore:
C:\Users\mazin\Desktop\Python\log_pipeline\alembic.ini:
C:\Users\mazin\Desktop\Python\log_pipeline\alert_worker.py:
C:\Users\mazin\Desktop\Python\log_pipeline\check_db.py:
C:\Users\mazin\Desktop\Python\log_pipeline\docker-compose.yml:
C:\Users\mazin\Desktop\Python\log_pipeline\Dockerfile:
C:\Users\mazin\Desktop\Python\log_pipeline\logs.json:
C:\Users\mazin\Desktop\Python\log_pipeline\README.md:
C:\Users\mazin\Desktop\Python\log_pipeline\requirements.txt:
C:\Users\mazin\Desktop\Python\log_pipeline\worker.py:


            <Brush
              dataKey="minute"
              height={8}
              stroke="#334155"
              travellerWidth={8}
              fill="#0f172a"
              tickFormatter={() => ""}
            />


            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />


docker-compose down -v
docker-compose up --build


✅ 3. Qué debes ver ahora
En logs de logs_api:
🚀 Running migrations...
🔥 Starting API...
Application startup complete.
Uvicorn running on http://0.0.0.0:10000


🧠 Regla de oro (esto te va a ahorrar MUCHO tiempo)
Siempre prueba en este orden:
/health
/logs
worker logs
/metrics
Nunca al revés.


🔹 Paso 1 → health check
GET http://localhost:8000/health/
Debe devolver:
{"status": "ok"}
👉 Si esto falla → TODO lo demás fallará


🔹 Paso 2 → enviar log
POST http://localhost:8000/logs/

Ejemplos de POST:
{ "endpoint": "/login", "method": "GET", "status_code": 200, "response_time": 1.0 }
{ "endpoint": "/login", "method": "GET", "status_code": 200, "response_time": 2.0 }
{ "endpoint": "/test", "method": "GET", "status_code": 200, "response_time": 0.2 }
{ "endpoint": "/slow", "method": "GET", "status_code": 200, "response_time": 5.0 }


Body:
{
  "endpoint": "/test",
  "method": "GET",
  "status_code": 500
}
Debe devolver:
{"status": "queued"}



🔹 Paso 3 → mirar logs del worker
Debes ver:
📥 Procesando log
✅ Log guardado
👉 Si esto no aparece → Redis/worker mal


🔹 Paso 4 → consultar métricas
GET http://localhost:8000/metrics/
(no body, no JSON, nada)

Mirarlo por minuto
GET http://localhost:8000/metrics/?minute=2026-04-16T10:41

Mira los ultimos X minutos (Ejemplo 5)
GET http://localhost:8000/metrics/window?minutes=5



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

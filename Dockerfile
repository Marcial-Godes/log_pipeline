FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 🔥 Dar permisos al script de arranque
RUN chmod +x app/core/start.sh

CMD ["sh", "app/core/start.sh"]
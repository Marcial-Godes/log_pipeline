import requests
import random
import datetime
import time

URL = "http://127.0.0.1:8000/logs/"

methods = ["GET", "POST", "PUT", "DELETE"]
endpoints = ["/users", "/login", "/items", "/orders", "/test"]

while True:
    payload = {
        "timestamp": datetime.datetime.now(datetime.UTC).isoformat(),
        "method": random.choice(methods),
        "endpoint": random.choice(endpoints),

        # 🔥 MÁS ERRORES (clave)
        "status_code": random.choices(
            [200, 201, 400, 401, 404, 500],
            weights=[30, 10, 20, 10, 15, 15]
        )[0],

        "response_time": round(random.uniform(0.1, 1.5), 3),
        "ip": "127.0.0.1"
    }

    try:
        requests.post(URL, json=payload)
        print("OK:", payload["status_code"])
    except Exception as e:
        print("ERROR:", e)

    time.sleep(0.2)
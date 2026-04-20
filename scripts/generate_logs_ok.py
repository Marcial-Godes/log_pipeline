import requests
import random
import time

URL = "http://127.0.0.1:8000/logs/"

methods = ["GET", "POST", "PUT", "DELETE"]
endpoints = ["/users", "/login", "/items", "/orders", "/test"]

while True:
    payload = {
        "endpoint": random.choice(endpoints),
        "method": random.choice(methods),

        # 🔥 distribución de errores
        "status_code": 200,



        "response_time": round(random.uniform(0.1, 0.4), 3),
        "ip": "127.0.0.1"
    }

    try:
        res = requests.post(URL, json=payload)
        print("OK:", payload["status_code"], "| API:", res.status_code)
    except Exception as e:
        print("ERROR:", e)

    time.sleep(0.1)
import os
import requests
import random
import time
from datetime import datetime, UTC

URL = os.getenv(
    "API_URL",
    "http://localhost:8000/logs/"
)

methods = ["GET", "POST", "PUT", "DELETE"]
endpoints = ["/users", "/login", "/items", "/orders", "/test"]

print(f"Enviando logs a {URL}", flush=True)

while True:
    payload = {
        "endpoint": random.choice(endpoints),
        "method": random.choice(methods),

        "status_code": random.choices(
            [200, 201, 400, 401, 404, 500],
            weights=[30,10,20,10,15,15]
        )[0],

        "response_time": round(
            random.uniform(0.1,1.5),3
        ),

        "ip": "127.0.0.1",
        "timestamp": datetime.now(UTC).isoformat()
    }

    try:
        res = requests.post(
            URL,
            json=payload,
            timeout=(3,10),
            headers={
                "Connection": "close",
                "User-Agent": "demo-generator"
            }
        )

        print(
            f"OK {payload['status_code']} | API {res.status_code}",
            flush=True
        )

    except Exception as e:
        print(
            f"ERROR: {e}",
            flush=True
        )
        time.sleep(random.uniform(0.6,1.8))
        continue

    time.sleep(0.2)
import time
import random
import requests

API_URL = "http://127.0.0.1:8000/logs"


levels = ["INFO", "WARNING", "ERROR"]
services = ["auth", "api", "payments"]
endpoints = ["/login", "/users", "/orders", "/payments"]
methods = ["GET", "POST"]


def generate_log():
    level = random.choice(levels)
    endpoint = random.choice(endpoints)

    return {
        "level": level,
        "message": f"{level} event on {endpoint}",
        "service": random.choice(services),
        "endpoint": endpoint,
        "method": random.choice(methods),
        "status_code": 500 if level == "ERROR" else 200,
    }


def stream_logs():
    print("🚀 Streaming logs... (CTRL+C para parar)\n")

    while True:
        log = generate_log()

        try:
            response = requests.post(API_URL, json=log)

            if response.status_code == 200:
                print(f"✔ {log['level']} → {log['endpoint']}")
            else:
                print(f"❌ Error {response.status_code}")

        except Exception as e:
            print(f"🔥 Error conexión: {e}")

        time.sleep(1)  # 1 log por segundo


if __name__ == "__main__":
    stream_logs()
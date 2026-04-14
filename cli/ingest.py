import json
import sys
import requests

API_URL = "http://127.0.0.1:8000/logs/batch"


def ingest_file(file_path: str):
    with open(file_path, "r") as f:
        logs = json.load(f)

    response = requests.post(API_URL, json=logs)

    if response.status_code == 200:
        print(f"✔ Logs enviados: {len(logs)}")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python cli/ingest.py archivo.json")
        sys.exit(1)

    file_path = sys.argv[1]
    ingest_file(file_path)
import time
from fastapi import Request, HTTPException


class RateLimiter:
    def __init__(self, max_requests: int = 5, window_seconds: int = 1):
        self.max_requests = max_requests
        self.window_seconds = window_seconds

        self.requests = {}  # {ip: [timestamps]}

    def is_allowed(self, client_ip: str):
        now = time.time()

        if client_ip not in self.requests:
            self.requests[client_ip] = []

        # limpiar requests antiguos
        self.requests[client_ip] = [
            ts for ts in self.requests[client_ip]
            if now - ts < self.window_seconds
        ]

        if len(self.requests[client_ip]) >= self.max_requests:
            return False

        self.requests[client_ip].append(now)
        return True


# instancia global
rate_limiter = RateLimiter(max_requests=5, window_seconds=1)


def rate_limit(request: Request):
    client_ip = request.client.host

    if not rate_limiter.is_allowed(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Too many requests"
        )
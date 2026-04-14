import time


class Metrics:
    def __init__(self):
        self.total_logs = 0
        self.error_logs = 0

        self.logs_last_second = 0
        self.last_reset = time.time()

    def log_received(self, level: str):
        self.total_logs += 1
        self.logs_last_second += 1

        if level == "ERROR":
            self.error_logs += 1

        self._reset_if_needed()

    def _reset_if_needed(self):
        now = time.time()

        if now - self.last_reset >= 1:
            self.logs_last_second = 0
            self.last_reset = now

    def get_metrics(self):
        return {
            "total_logs": self.total_logs,
            "error_logs": self.error_logs,
            "logs_per_second": self.logs_last_second
        }


metrics = Metrics()

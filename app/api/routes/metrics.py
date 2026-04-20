from fastapi import APIRouter, Query
from datetime import datetime, timedelta
from collections import defaultdict

from app.core.redis_client import redis_client

router = APIRouter(prefix="/metrics", tags=["metrics"])


def get_current_minute():
    return datetime.utcnow().replace(second=0, microsecond=0)


def format_minute(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M")


def format_label(dt: datetime) -> str:
    return dt.strftime("%H:%M")


# =========================
# 🧠 MEDIA MÓVIL (CORRECTA)
# =========================
def moving_average(series, window=3):
    result = []

    for i in range(len(series)):
        values = series[max(0, i - window + 1): i + 1]

        # 🔥 SOLO suavizamos la latencia
        valid_values = [p for p in values if p["avg_response_time"] > 0]

        if valid_values:
            avg_response = sum(p["avg_response_time"] for p in valid_values) / len(valid_values)
        else:
            avg_response = 0

        result.append({
            **series[i],
            "avg_response_time": round(avg_response, 3),
            # ❌ NO tocamos errors ni error_rate
        })

    return result


@router.get("/window")
async def get_metrics_window(
    minutes: int = Query(default=5),
    top: int = Query(default=5),
    endpoint: str | None = Query(default=None)
):
    now = get_current_minute()

    totals = 0
    errors = 0

    time_sum = defaultdict(float)
    time_count = defaultdict(int)

    for i in range(minutes):
        minute_dt = now - timedelta(minutes=i)
        minute = format_minute(minute_dt)

        if endpoint:
            totals += int(
                (await redis_client.hget(f"metrics:{minute}:endpoints", endpoint)) or 0
            )
            errors += int(
                (await redis_client.hget(f"metrics:{minute}:errors_by_endpoint", endpoint)) or 0
            )

            time_sum[endpoint] += float(
                (await redis_client.hget(f"metrics:{minute}:response_time_sum", endpoint)) or 0
            )

            time_count[endpoint] += int(
                (await redis_client.hget(f"metrics:{minute}:response_time_count", endpoint)) or 0
            )

        else:
            totals += int(await redis_client.get(f"metrics:{minute}:total") or 0)
            errors += int(await redis_client.get(f"metrics:{minute}:errors") or 0)

            raw_sum = await redis_client.hgetall(f"metrics:{minute}:response_time_sum")
            raw_count = await redis_client.hgetall(f"metrics:{minute}:response_time_count")

            for k, v in raw_sum.items():
                time_sum[k] += float(v)

            for k, v in raw_count.items():
                time_count[k] += int(v)

    total_time_global = sum(time_sum.values())
    total_count_global = sum(time_count.values())

    avg_global = (
        total_time_global / total_count_global
        if total_count_global > 0
        else 0
    )

    avg_response_time = []

    for ep in time_sum:
        count = time_count.get(ep, 1)
        avg = time_sum[ep] / count if count else 0

        avg_response_time.append({
            "endpoint": ep,
            "avg_response_time": round(avg, 3),
            "count": count
        })

    slowest_endpoints = sorted(
        avg_response_time,
        key=lambda x: x["avg_response_time"],
        reverse=True
    )[:top]

    error_rate = (errors / totals * 100) if totals > 0 else 0

    return {
        "window_minutes": minutes,
        "endpoint": endpoint,
        "total": totals,
        "errors": errors,
        "error_rate": round(error_rate),
        "avg_response_time_global": round(avg_global, 3),
        "avg_response_time": avg_response_time,
        "slowest_endpoints": slowest_endpoints,
    }


# =========================
# 📈 TIMESERIES (CORREGIDO)
# =========================
@router.get("/timeseries")
async def get_timeseries(
    minutes: int = Query(default=10),
    endpoint: str | None = Query(default=None)
):
    now = get_current_minute()

    series = []

    for i in range(minutes):
        minute_dt = now - timedelta(minutes=i)
        minute = format_minute(minute_dt)

        if endpoint:
            total = int(
                (await redis_client.hget(f"metrics:{minute}:endpoints", endpoint)) or 0
            )
            errors = int(
                (await redis_client.hget(f"metrics:{minute}:errors_by_endpoint", endpoint)) or 0
            )

            time_sum = float(
                (await redis_client.hget(f"metrics:{minute}:response_time_sum", endpoint)) or 0
            )
            time_count = int(
                (await redis_client.hget(f"metrics:{minute}:response_time_count", endpoint)) or 0
            )

        else:
            total = int(await redis_client.get(f"metrics:{minute}:total") or 0)
            errors = int(await redis_client.get(f"metrics:{minute}:errors") or 0)

            raw_sum = await redis_client.hgetall(f"metrics:{minute}:response_time_sum")
            raw_count = await redis_client.hgetall(f"metrics:{minute}:response_time_count")

            time_sum = sum(float(v) for v in raw_sum.values())
            time_count = sum(int(v) for v in raw_count.values())

        avg = (time_sum / time_count) if time_count > 0 else 0
        error_rate = (errors / total * 100) if total > 0 else 0

        series.append({
            "minute": format_label(minute_dt),
            "avg_response_time": round(avg, 3),
            "errors": errors,
            "error_rate": round(error_rate)
        })

    series.reverse()

    # 🔥 SOLO suavizamos latencia (no errores)
    series = moving_average(series, window=3)

    return {
        "series": series
    }
from app.core.database import SessionLocal


def check_columns():
    print("\n📊 COLUMNAS EN raw_logs:\n")

    for column in RawLog.__table__.columns:
        print(f"- {column.name} ({column.type})")


def check_rows():
    print("\n📊 FILAS EN raw_logs:\n")

    db = SessionLocal()

    try:
        logs = db.query(RawLog).order_by(RawLog.id.desc()).limit(10).all()

        if not logs:
            print("⚠️ No hay registros")
            return

        for log in logs:
            print(
                f"- id={log.id}, endpoint={log.endpoint}, "
                f"status={log.status_code}, method={log.method}, "
                f"ip={log.ip}"
            )

    finally:
        db.close()


if __name__ == "__main__":
    check_columns()
    check_rows()
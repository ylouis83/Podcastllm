from celery import Celery
import os

# It's a good practice to use environment variables for configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["backend.tasks"]  # We will create this tasks.py file next
)

celery_app.conf.update(
    task_track_started=True,
)

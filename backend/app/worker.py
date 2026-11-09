import time
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import SessionLocal
from app.models import ScanJob, ScanJobItem, Snapshot, ChangeEvent
from app.crawler import fetch_page, classify_change
from app.config import WORKER_POLL_SECONDS

def process_one_job():
    with SessionLocal() as db:
        job = db.execute(
            select(ScanJob).where(ScanJob.status == "queued").order_by(ScanJob.created_at).limit(1)
        ).scalar_one_or_none()
        if job is None:
            return False
        job.status = "running"
        job.started_at = datetime.now(timezone.utc)
        db.commit()
        job_id = job.id

    with SessionLocal() as db:
        items = db.query(ScanJobItem).filter_by(job_id=job_id, status="queued").all()
        for item in items:
            item.status = "running"
            db.commit()
            try:
                url = item.website.url
                text, digest = fetch_page(url)
                previous = db.query(Snapshot).filter_by(
                    website_id=item.website_id, page_url=url
                ).order_by(Snapshot.id.desc()).first()

                snapshot = Snapshot(
                    website_id=item.website_id, page_url=url,
                    content_hash=digest, extracted_text=text
                )
                db.add(snapshot)
                db.flush()

                if previous and previous.content_hash != digest:
                    # Store a bounded excerpt, not an unreviewed claim of factual significance.
                    before = previous.extracted_text[:12000]
                    after = text[:12000]
                    category = classify_change(before, after)
                    db.add(ChangeEvent(
                        website_id=item.website_id, snapshot_id=snapshot.id,
                        page_url=url, category=category,
                        title=f"Content changed on {item.website.name}",
                        before_text=before, after_text=after,
                        verification_status="unverified",
                    ))
                item.status = "completed"
                db.commit()
            except Exception as exc:
                item.status = "failed"
                item.error = str(exc)[:2000]
                db.commit()

        job = db.query(ScanJob).filter_by(id=job_id).first()
        completed = db.query(ScanJobItem).filter(ScanJobItem.job_id == job_id, ScanJobItem.status == "completed").count()
        failed = db.query(ScanJobItem).filter(ScanJobItem.job_id == job_id, ScanJobItem.status == "failed").count()
        job.completed_sites = completed + failed
        job.status = "completed" if failed == 0 else ("completed_with_errors" if completed else "failed")
        job.completed_at = datetime.now(timezone.utc)
        db.commit()
    return True

def run_worker():
    print("Casino Intel Radar worker started.")
    while True:
        did_work = process_one_job()
        if not did_work:
            time.sleep(WORKER_POLL_SECONDS)

if __name__ == "__main__":
    run_worker()

from datetime import datetime, timezone
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import Base, engine, get_db
from app.models import Website, ScanJob, ScanJobItem, Snapshot, ChangeEvent

app = FastAPI(title="Casino Intel Radar API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

SEED_WEBSITES = [
    ("Stake", "crypto", "https://stake.com"),
    ("Chumba Casino", "sweepstakes", "https://www.chumbacasino.com"),
    ("BetMGM", "real_money", "https://www.betmgm.com"),
    ("bet365", "sportsbook", "https://www.bet365.com"),
    ("Polymarket", "prediction_market", "https://polymarket.com"),
]

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:
        for name, category, url in SEED_WEBSITES:
            if not db.query(Website).filter_by(url=url).first():
                db.add(Website(name=name, category=category, url=url))
        db.commit()

@app.get("/health")
def health():
    return {"status": "ok", "service": "casino-intel-radar"}

@app.get("/api/websites")
def list_websites(db: Session = Depends(get_db)):
    sites = db.query(Website).filter_by(enabled=True).order_by(Website.id).all()
    return [{"id": s.id, "name": s.name, "category": s.category, "url": s.url} for s in sites]

@app.post("/api/scans")
def create_scan(db: Session = Depends(get_db)):
    sites = db.query(Website).filter_by(enabled=True).order_by(Website.id).all()
    if not sites:
        raise HTTPException(status_code=400, detail="No enabled websites are configured.")
    job = ScanJob(status="queued", total_sites=len(sites), completed_sites=0)
    db.add(job)
    db.flush()
    for site in sites:
        db.add(ScanJobItem(job_id=job.id, website_id=site.id, status="queued"))
    db.commit()
    return {"job_id": job.id, "status": job.status, "total_sites": job.total_sites}

@app.get("/api/scans/{job_id}")
def get_scan(job_id: int, db: Session = Depends(get_db)):
    job = db.query(ScanJob).filter_by(id=job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Scan job not found.")
    items = db.query(ScanJobItem).filter_by(job_id=job_id).all()
    return {
        "job_id": job.id, "status": job.status, "total_sites": job.total_sites,
        "completed_sites": job.completed_sites, "error": job.error,
        "items": [{"website": item.website.name, "url": item.website.url,
                   "status": item.status, "error": item.error} for item in items],
    }


@app.get("/api/changes")
def list_changes(limit: int = 50, db: Session = Depends(get_db)):
    limit = max(1, min(limit, 200))

    rows = (
        db.query(ChangeEvent, Website)
        .join(Website, ChangeEvent.website_id == Website.id)
        .order_by(desc(ChangeEvent.detected_at))
        .limit(limit)
        .all()
    )

    return [
        {
            "id": event.id,
            "website": website.name,
            "page_url": event.page_url,
            "category": event.category,
            "title": event.title,
            "before_text": event.before_text,
            "after_text": event.after_text,
            "verification_status": event.verification_status,
            "detected_at": event.detected_at.isoformat(),
        }
        for event, website in rows
    ]


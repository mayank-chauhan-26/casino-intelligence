import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./casino_intel.db")
CRAWL_TIMEOUT_SECONDS = int(os.getenv("CRAWL_TIMEOUT_SECONDS", "20"))
CRAWL_MAX_BYTES = int(os.getenv("CRAWL_MAX_BYTES", "2000000"))
CRAWL_USER_AGENT = os.getenv(
    "CRAWL_USER_AGENT",
    "CasinoIntelRadarBot/0.1 (+contact: admin@example.com)"
)
WORKER_POLL_SECONDS = int(os.getenv("WORKER_POLL_SECONDS", "3"))

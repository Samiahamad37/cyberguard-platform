from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.models import user as _user_model  # noqa: F401
from app.routers import assistant, auth, malware, phishing, threat_intel, website

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = settings.api_v1_prefix
app.include_router(auth.router, prefix=api)
app.include_router(phishing.router, prefix=api)
app.include_router(malware.router, prefix=api)
app.include_router(website.router, prefix=api)
app.include_router(assistant.router, prefix=api)
app.include_router(threat_intel.router, prefix=api)


@app.get("/health")
def health():
    return {"status": "ok", "service": "cyberguard-ai"}

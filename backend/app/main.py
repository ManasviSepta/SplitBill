import logging
import sys
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.health import router as health_router
from app.api.receipt import router as receipt_router
from app.api.split import router as split_router
from app.config import settings

# Configure structured Python logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger("splitbill.main")

# Initialize FastAPI application
app = FastAPI(
    title="SplitBill API",
    description="Precision AI-Powered Dining Bill Splitting Backend with Gemini Vision OCR and Proportional Split Engine.",
    version="1.0.0",
    docs_url="/docs" if settings.DOCS_ENABLED else None,
    redoc_url="/redoc" if settings.DOCS_ENABLED else None,
)

# Configure CORS Middleware for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    """Log incoming HTTP requests and response statuses."""
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Completed {request.method} {request.url.path} with status {response.status_code}")
    return response


# Global Exception Handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Return clean, user-friendly JSON error response for HTTP exceptions."""
    logger.warning(f"HTTP {exc.status_code} on {request.url.path}: {exc.detail}")
    if isinstance(exc.detail, dict):
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "statusCode": exc.status_code,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catch-all for unexpected internal server errors."""
    logger.error(f"Unhandled error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "An unexpected server error occurred. Please try again.",
            "statusCode": 500,
        },
    )


# Register API Routers under /api
app.include_router(health_router, prefix="/api")
app.include_router(receipt_router, prefix="/api")
app.include_router(split_router, prefix="/api")


@app.get("/", summary="Root index")
async def root():
    """Root landing endpoint for API health verification."""
    return {
        "service": "SplitBill API",
        "status": "online",
        "docs": "/docs",
        "health": "/api/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )

"""API Routers for SplitBill Backend."""
from .health import router as health_router
from .receipt import router as receipt_router
from .split import router as split_router

__all__ = ["health_router", "receipt_router", "split_router"]

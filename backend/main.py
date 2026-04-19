from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models  # registers all ORM classes with Base
from routers import auth, products, cart, orders, payment, admin, policies

# Create all tables automatically — no migration commands needed
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ShopKenya API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/auth",     tags=["Auth"])
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(cart.router,     prefix="/cart",     tags=["Cart"])
app.include_router(orders.router,   prefix="/orders",   tags=["Orders"])
app.include_router(payment.router,  prefix="/payment",  tags=["Payment"])
app.include_router(admin.router,    prefix="/admin",    tags=["Admin"])
app.include_router(policies.router, prefix="/policies", tags=["Policies"])

# Serve static files (uploads)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def root():
    return {"message": "ShopKenya API is running ✅", "docs": "/docs"}

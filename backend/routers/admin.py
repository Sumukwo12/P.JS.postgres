from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Order, Product, OrderStatus
from schemas import UserOut, OrderOut
from utils.auth import require_admin

router = APIRouter()


from sqlalchemy import func

@router.get("/stats")
def stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    # Calculate revenue for all successful stages
    successful_statuses = [
        OrderStatus.paid, 
        OrderStatus.processing, 
        OrderStatus.shipped, 
        OrderStatus.delivered
    ]
    
    total_revenue = db.query(func.sum(Order.total_amount))\
        .filter(Order.status.in_(successful_statuses))\
        .scalar() or 0.0

    return {
        "total_users":    db.query(User).count(),
        "total_orders":   db.query(Order).count(),
        "total_products": db.query(Product).count(),
        "total_revenue":  total_revenue,
    }


@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/orders", response_model=List[OrderOut])
def list_orders(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(Order).order_by(Order.created_at.desc()).all()


@router.put("/orders/{order_id}/status")
def update_status(order_id: int, status: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    valid = [s.value for s in OrderStatus]
    if status not in valid:
        raise HTTPException(400, f"Must be one of: {valid}")
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order: raise HTTPException(404, "Order not found")
    order.status = status
    db.commit()
    return {"detail": f"Order #{order_id} → {status}"}

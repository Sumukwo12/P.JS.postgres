from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Order, OrderItem, CartItem
from schemas import OrderCreate, OrderOut
from utils.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=OrderOut)
def create_order(data: OrderCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    items = db.query(CartItem).filter(CartItem.user_id == user.id).all()
    if not items:
        raise HTTPException(400, "Cart is empty")
    total = sum(i.product.price * i.quantity for i in items)
    order = Order(user_id=user.id, total_amount=total,
                  shipping_address=data.shipping_address, phone=data.phone)
    db.add(order); db.flush()
    for i in items:
        db.add(OrderItem(order_id=order.id, product_id=i.product_id,
                         quantity=i.quantity, unit_price=i.product.price,
                         selected_variants=i.selected_variants))
    db.query(CartItem).filter(CartItem.user_id == user.id).delete()
    db.commit(); db.refresh(order)
    return order


@router.get("/", response_model=List[OrderOut])
def list_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    if not order: raise HTTPException(404, "Order not found")
    return order

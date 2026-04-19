from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import CartItem, Product
from schemas import CartItemCreate, CartItemOut
from utils.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[CartItemOut])
def get_cart(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(CartItem).filter(CartItem.user_id == user.id).all()


@router.post("/", response_model=CartItemOut)
def add_to_cart(data: CartItemCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    
    # Check for existing item with SAME variants
    existing = db.query(CartItem).filter(
        CartItem.user_id == user.id, 
        CartItem.product_id == data.product_id,
        CartItem.selected_variants == data.selected_variants
    ).first()

    if existing:
        existing.quantity += data.quantity
        db.commit(); db.refresh(existing)
        return existing
        
    item = CartItem(
        user_id=user.id, 
        product_id=data.product_id, 
        quantity=data.quantity,
        selected_variants=data.selected_variants
    )
    db.add(item); db.commit(); db.refresh(item)
    return item


@router.put("/{item_id}", response_model=CartItemOut)
def update_cart(item_id: int, quantity: int = Query(..., ge=0),
                db: Session = Depends(get_db), user=Depends(get_current_user)):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == user.id).first()
    if not item: raise HTTPException(404, "Cart item not found")
    if quantity == 0:
        db.delete(item); db.commit(); return None
    item.quantity = quantity
    db.commit(); db.refresh(item)
    return item


@router.delete("/{item_id}")
def remove_item(item_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == user.id).first()
    if not item: raise HTTPException(404, "Item not found")
    db.delete(item); db.commit()
    return {"detail": "Removed"}


@router.delete("/")
def clear_cart(db: Session = Depends(get_db), user=Depends(get_current_user)):
    db.query(CartItem).filter(CartItem.user_id == user.id).delete()
    db.commit()
    return {"detail": "Cart cleared"}

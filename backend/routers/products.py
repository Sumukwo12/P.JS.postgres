from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from database import get_db
from models import Product, Category
from schemas import ProductOut, ProductCreate, CategoryOut
from utils.auth import require_admin

router = APIRouter()

UPLOAD_DIR = "static/uploads"

@router.get("/categories/all", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name).all()


@router.get("/", response_model=List[ProductOut])
def list_products(
    search:      Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    is_featured: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Product)
    if search:      q = q.filter(Product.name.ilike(f"%{search}%"))
    if category_id: q = q.filter(Product.category_id == category_id)
    if is_featured is not None: q = q.filter(Product.is_featured == is_featured)
    return q.order_by(Product.id.desc()).all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p: raise HTTPException(404, "Product not found")
    return p


@router.post("/", response_model=ProductOut)
async def create_product(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    price: float = Form(...),
    stock: int = Form(...),
    category_id: int = Form(...),
    image_url: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    is_featured: bool = Form(False),
    variants_json: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    if not db.query(Category).filter(Category.id == category_id).first():
        raise HTTPException(400, "Category not found")
    
    final_image_url = image_url
    
    if image:
        file_ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as f:
            content = await image.read()
            f.write(content)
        
        final_image_url = f"/static/uploads/{filename}"

    p = Product(
        name=name,
        description=description,
        price=price,
        stock=stock,
        category_id=category_id,
        image_url=final_image_url,
        is_featured=is_featured,
        variants=eval(variants_json) if variants_json else None
    )
    db.add(p); db.commit(); db.refresh(p)
    return p


@router.put("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: int,
    name: str = Form(...),
    description: Optional[str] = Form(None),
    price: float = Form(...),
    stock: int = Form(...),
    category_id: int = Form(...),
    image_url: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    is_featured: bool = Form(False),
    variants_json: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p: raise HTTPException(404, "Product not found")
    
    final_image_url = image_url
    
    if image:
        file_ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as f:
            content = await image.read()
            f.write(content)
        
        final_image_url = f"/static/uploads/{filename}"

    p.name = name
    p.description = description
    p.price = price
    p.stock = stock
    p.category_id = category_id
    p.image_url = final_image_url
    p.is_featured = is_featured
    if variants_json is not None:
        import json
        p.variants = json.loads(variants_json) if variants_json else None
    
    db.commit(); db.refresh(p)
    return p


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p: raise HTTPException(404, "Product not found")
    db.delete(p); db.commit()
    return {"detail": "Deleted"}

import csv
import io

@router.post("/bulk")
async def bulk_create_products(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(400, "Only CSV files are allowed")

    content = await file.read()
    decoded = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded))
    
    products_to_add = []
    errors = []
    
    for row in reader:
        try:
            name        = row.get('name') or row.get('Name')
            desc        = row.get('description') or row.get('Description')
            price       = float(row.get('price') or row.get('Price') or 0)
            stock       = int(row.get('stock') or row.get('Stock') or 0)
            cat_id      = int(row.get('category_id') or row.get('Category ID') or 0)
            image_url   = row.get('image_url') or row.get('Image URL')
            is_featured = row.get('is_featured', 'false').lower() == 'true'

            if not name or not cat_id:
                errors.append(f"Skipping row: Missing Name or Category ID for {name}")
                continue

            p = Product(
                name=name,
                description=desc,
                price=price,
                stock=stock,
                category_id=cat_id,
                image_url=image_url,
                is_featured=is_featured
            )
            products_to_add.append(p)
        except Exception as e:
            errors.append(f"Error parsing row: {str(e)}")

    if products_to_add:
        db.add_all(products_to_add)
        db.commit()
    
    return {
        "detail": f"Successfully imported {len(products_to_add)} products",
        "errors": errors if errors else None
    }


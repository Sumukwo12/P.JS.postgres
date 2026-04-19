from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserRegister(BaseModel):
    name:     str
    email:    EmailStr
    password: str
    phone:    Optional[str] = None

class UserLogin(BaseModel):
    email:    EmailStr
    password: str

class UserOut(BaseModel):
    id:       int
    name:     str
    email:    str
    phone:    Optional[str] = None
    is_admin: bool
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type:   str
    user:         UserOut

class CategoryOut(BaseModel):
    id:   int
    name: str
    model_config = {"from_attributes": True}

class ProductCreate(BaseModel):
    name:        str
    description: Optional[str] = None
    price:       float
    image_url:   Optional[str] = None
    stock:       int
    category_id: int
    is_featured: Optional[bool] = False
    variants:    Optional[dict] = None

class ProductOut(BaseModel):
    id:          int
    name:        str
    description: Optional[str] = None
    price:       float
    image_url:   Optional[str] = None
    stock:       int
    is_featured: bool
    variants:    Optional[dict] = None
    category:    Optional[CategoryOut] = None
    created_at:  datetime
    model_config = {"from_attributes": True}

class CartItemCreate(BaseModel):
    product_id:        int
    quantity:          int = 1
    selected_variants: Optional[dict] = None

class CartItemOut(BaseModel):
    id:                int
    quantity:          int
    selected_variants: Optional[dict] = None
    product:           ProductOut
    model_config = {"from_attributes": True}

class OrderCreate(BaseModel):
    shipping_address: str
    phone:            str

class OrderItemOut(BaseModel):
    id:                int
    quantity:          int
    unit_price:        float
    selected_variants: Optional[dict] = None
    product:           ProductOut
    model_config = {"from_attributes": True}

class OrderOut(BaseModel):
    id:               int
    total_amount:     float
    status:           str
    shipping_address: str
    phone:            str
    created_at:       datetime
    items:            List[OrderItemOut] = []
    model_config = {"from_attributes": True}

class MpesaSTKRequest(BaseModel):
    order_id: int
    phone:    str

class PolicyCreate(BaseModel):
    slug:    str
    title:   str
    content: str

class PolicyOut(BaseModel):
    id: int
    slug: str
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
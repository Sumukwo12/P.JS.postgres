from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class OrderStatus(str, enum.Enum):
    pending    = "pending"
    paid       = "paid"
    processing = "processing"
    shipped    = "shipped"
    delivered  = "delivered"
    cancelled  = "cancelled"


class User(Base):
    __tablename__ = "users"
    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String(200), nullable=False)
    email           = Column(String(200), unique=True, index=True, nullable=False)
    hashed_password = Column(String(500), nullable=False)
    phone           = Column(String(50), nullable=True)
    is_admin        = Column(Boolean, default=False, nullable=False)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    orders          = relationship("Order",    back_populates="user")
    cart_items      = relationship("CartItem", back_populates="user")


class Category(Base):
    __tablename__ = "categories"
    id       = Column(Integer, primary_key=True, index=True)
    name     = Column(String(100), unique=True, nullable=False)
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"
    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    price       = Column(Float, nullable=False)
    image_url   = Column(String(500), nullable=True)
    stock       = Column(Integer, default=0, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    variants    = Column(JSON, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    category    = relationship("Category",  back_populates="products")
    cart_items  = relationship("CartItem",  back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")


class CartItem(Base):
    __tablename__ = "cart_items"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id        = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity          = Column(Integer, default=1, nullable=False)
    selected_variants = Column(JSON, nullable=True)
    user       = relationship("User",    back_populates="cart_items")
    product    = relationship("Product", back_populates="cart_items")


class Order(Base):
    __tablename__ = "orders"
    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount     = Column(Float, nullable=False)
    status           = Column(Enum(OrderStatus), default=OrderStatus.pending, nullable=False)
    shipping_address = Column(Text, nullable=False)
    phone            = Column(String(50), nullable=False)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    user             = relationship("User",      back_populates="orders")
    items            = relationship("OrderItem", back_populates="order")
    payment          = relationship("Payment",   back_populates="order", uselist=False)


class OrderItem(Base):
    __tablename__ = "order_items"
    id                = Column(Integer, primary_key=True, index=True)
    order_id          = Column(Integer, ForeignKey("orders.id"),   nullable=False)
    product_id        = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity          = Column(Integer, nullable=False)
    unit_price        = Column(Float,   nullable=False)
    selected_variants = Column(JSON,    nullable=True)
    order             = relationship("Order",   back_populates="items")
    product           = relationship("Product", back_populates="order_items")


class Payment(Base):
    __tablename__ = "payments"
    id                        = Column(Integer, primary_key=True, index=True)
    order_id                  = Column(Integer, ForeignKey("orders.id"), unique=True)
    mpesa_checkout_request_id = Column(String(200), unique=True, nullable=True)
    mpesa_receipt_number      = Column(String(100), nullable=True)
    amount                    = Column(Float, nullable=False)
    phone                     = Column(String(50), nullable=False)
    status                    = Column(String(50), default="pending", nullable=False)
    created_at                = Column(DateTime(timezone=True), server_default=func.now())
    order                     = relationship("Order", back_populates="payment")

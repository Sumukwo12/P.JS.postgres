from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Category
from schemas import UserRegister, UserLogin, Token, UserOut
from utils.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()

DEFAULT_CATEGORIES = ["Electronics", "Fashion", "Beauty", "Home & Kitchen", "Sports", "Books"]


def _seed_categories(db: Session):
    """Create default product categories on first registration."""
    if db.query(Category).count() == 0:
        for name in DEFAULT_CATEGORIES:
            db.add(Category(name=name))
        db.commit()


@router.post("/register", response_model=Token)
def register(data: UserRegister, db: Session = Depends(get_db)):
    # Seed categories on first use
    _seed_categories(db)

    email = data.email.lower().strip()

    # Check duplicate email
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered. Please login instead.")

    user = User(
        name=data.name.strip(),
        email=email,
        hashed_password=hash_password(data.password),
        phone=data.phone,
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # FIX: model_validate() is the Pydantic v2 equivalent of from_orm()
    return Token(
        access_token=create_access_token(user.id),
        token_type="bearer",
        user=UserOut.model_validate(user),
    )


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    email = data.email.lower().strip()
    user  = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    return Token(
        access_token=create_access_token(user.id),
        token_type="bearer",
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)

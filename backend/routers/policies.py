from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Policy
from schemas import PolicyOut, PolicyCreate
from utils.auth import require_admin

router = APIRouter()

@router.get("/", response_model=List[PolicyOut])
def list_policies(db: Session = Depends(get_db)):
    """List all available policies."""
    return db.query(Policy).order_by(Policy.title).all()

@router.get("/{slug}", response_model=PolicyOut)
def get_policy(slug: str, db: Session = Depends(get_db)):
    """Fetch a specific policy by its slug."""
    policy = db.query(Policy).filter(Policy.slug == slug).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy

@router.post("/", response_model=PolicyOut)
def create_policy(policy_in: PolicyCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    """Create a new policy (Admin only)."""
    # Check if slug exists
    if db.query(Policy).filter(Policy.slug == policy_in.slug).first():
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    policy = Policy(**policy_in.model_dump())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy

@router.put("/{policy_id}", response_model=PolicyOut)
def update_policy(policy_id: int, policy_in: PolicyCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    """Update an existing policy (Admin only)."""
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    for key, value in policy_in.model_dump().items():
        setattr(policy, key, value)
    
    db.commit()
    db.refresh(policy)
    return policy

@router.delete("/{policy_id}")
def delete_policy(policy_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    """Delete a policy (Admin only)."""
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    db.delete(policy)
    db.commit()
    return {"detail": "Policy deleted successfully"}

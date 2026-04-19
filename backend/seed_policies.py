import sys
import os

# Add the parent directory to sys.path to import database and models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import Policy

def seed_policies():
    db = SessionLocal()
    try:
        # Check if privacy-policy exists
        existing = db.query(Policy).filter(Policy.slug == "privacy-policy").first()
        if existing:
            print("Privacy policy already exists.")
            return

        p = Policy(
            slug="privacy-policy",
            title="Privacy Policy",
            content="""Welcome to ShopKenya. Your privacy is our priority.

1. Data Collection
We collect information you provide directly to us when you create an account, make a purchase, or communicate with us.

2. How We Use Data
We use your information to process orders, improve our services, and send you relevant updates.

3. Secure Payments
All payments are processed securely via M-Pesa. We do not store your financial credentials.

4. Contact Us
If you have questions about this policy, contact support@shopkenya.com."""
        )
        db.add(p)
        db.commit()
        print("Seeded Privacy Policy successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_policies()

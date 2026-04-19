from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Order, Payment, OrderStatus
from schemas import MpesaSTKRequest
from utils.auth import get_current_user
from utils.mpesa import stk_push

router = APIRouter()


@router.post("/mpesa")
async def initiate_mpesa(data: MpesaSTKRequest, db: Session = Depends(get_db),
                         user=Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == data.order_id, Order.user_id == user.id).first()
    if not order: raise HTTPException(404, "Order not found")
    if order.status != OrderStatus.pending:
        raise HTTPException(400, f"Order already {order.status}")
    existing = db.query(Payment).filter(
        Payment.order_id == order.id, Payment.status == "pending").first()
    if existing:
        raise HTTPException(400, "Payment already pending — check your phone.")
    try:
        result = await stk_push(data.phone, order.total_amount, order.id)
        db.add(Payment(order_id=order.id,
                       mpesa_checkout_request_id=result.get("CheckoutRequestID"),
                       amount=order.total_amount, phone=data.phone, status="pending"))
        db.commit()
        return {"message": "STK Push sent — check your phone."}
    except Exception as e:
        raise HTTPException(500, f"M-Pesa error: {str(e)}")


@router.get("/status/{order_id}")
def payment_status(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    if not order: raise HTTPException(404, "Order not found")
    pay = db.query(Payment).filter(Payment.order_id == order_id).first()
    return {
        "order_status":   order.status,
        "payment_status": pay.status if pay else "not_initiated",
        "receipt":        pay.mpesa_receipt_number if pay else None,
    }


@router.post("/mpesa/callback")
async def mpesa_callback(payload: dict, db: Session = Depends(get_db)):
    try:
        body    = payload.get("Body", {}).get("stkCallback", {})
        chk_id  = body.get("CheckoutRequestID")
        code    = body.get("ResultCode")
        pay     = db.query(Payment).filter(Payment.mpesa_checkout_request_id == chk_id).first()
        if pay:
            if code == 0:
                items   = body.get("CallbackMetadata", {}).get("Item", [])
                receipt = next((i["Value"] for i in items if i["Name"] == "MpesaReceiptNumber"), None)
                pay.status = "success"; pay.mpesa_receipt_number = receipt
                order = db.query(Order).filter(Order.id == pay.order_id).first()
                if order: order.status = OrderStatus.paid
            else:
                pay.status = "failed"
            db.commit()
    except Exception as e:
        print(f"Callback error: {e}")
    return {"ResultCode": 0, "ResultDesc": "Accepted"}

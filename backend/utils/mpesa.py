import httpx, base64, os
from datetime import datetime

CONSUMER_KEY    = os.getenv("MPESA_CONSUMER_KEY",    "")
CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET", "")
SHORTCODE       = os.getenv("MPESA_SHORTCODE",       "174379")
PASSKEY         = os.getenv("MPESA_PASSKEY",         "")
CALLBACK_URL    = os.getenv("MPESA_CALLBACK_URL",    "https://yoursite.com/payment/mpesa/callback")
BASE_URL        = os.getenv("MPESA_BASE_URL",        "https://sandbox.safaricom.co.ke")


async def _get_token() -> str:
    creds = base64.b64encode(f"{CONSUMER_KEY}:{CONSUMER_SECRET}".encode()).decode()
    async with httpx.AsyncClient() as c:
        r = await c.get(
            f"{BASE_URL}/oauth/v1/generate?grant_type=client_credentials",
            headers={"Authorization": f"Basic {creds}"},
        )
        r.raise_for_status()
        return r.json()["access_token"]


def _password_and_timestamp():
    ts  = datetime.now().strftime("%Y%m%d%H%M%S")
    raw = base64.b64encode(f"{SHORTCODE}{PASSKEY}{ts}".encode()).decode()
    return raw, ts


def _normalize(phone: str) -> str:
    phone = phone.replace(" ", "").replace("-", "")
    if phone.startswith("+"): phone = phone[1:]
    if phone.startswith("0"): phone = "254" + phone[1:]
    return phone


async def stk_push(phone: str, amount: float, order_id: int) -> dict:
    token, ts = await _get_token(), _password_and_timestamp()[1]
    pw, _     = _password_and_timestamp()
    num       = _normalize(phone)
    async with httpx.AsyncClient() as c:
        r = await c.post(
            f"{BASE_URL}/mpesa/stkpush/v1/processrequest",
            json={
                "BusinessShortCode": SHORTCODE,
                "Password": pw, "Timestamp": ts,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": int(amount),
                "PartyA": num, "PartyB": SHORTCODE, "PhoneNumber": num,
                "CallBackURL": CALLBACK_URL,
                "AccountReference": f"Order-{order_id}",
                "TransactionDesc": f"ShopKenya Order {order_id}",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        r.raise_for_status()
        return r.json()

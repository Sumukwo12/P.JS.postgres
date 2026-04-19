# ShopKenya — Setup Guide (Windows)

## What You Need Installed
- **Python 3.11** → https://www.python.org/downloads/ ✅ tick "Add Python to PATH"
- **Node.js LTS** → https://nodejs.org
- **PostgreSQL**  → https://www.postgresql.org/download/windows/

---

## Step 1 — Create the PostgreSQL Database

Open pgAdmin or the SQL Shell and run:
```sql
CREATE DATABASE shopkenya;
```
Your `.env` is already set with:
```
DATABASE_URL=postgresql://postgres:sumuu@localhost:5432/shopkenya
```
If your postgres password is different, edit `backend/.env`.

---

## Step 2 — Start the Backend

Double-click **`backend/start_backend.bat`**

It will automatically:
- Create a Python virtual environment
- Install all packages
- Connect to PostgreSQL and create all tables
- Start the API on http://localhost:8000

✅ You should see: `Database connected successfully.`
📖 API docs: http://localhost:8000/docs

If you see a database error → check your postgres password in `backend/.env`.

---

## Step 3 — Start the Frontend

Open a second window and double-click **`frontend/start_frontend.bat`**

It will automatically:
- Install Node packages
- Start React on http://localhost:3000

---

## Step 4 — Register & Login

Go to http://localhost:3000/register and create an account.
The first categories (Electronics, Fashion, etc.) are created automatically.

---

## Step 5 — Make Yourself Admin (optional)

After registering, double-click **`backend/make_admin.bat`** and enter your email.

Then log in at http://localhost:3000/admin to manage products and orders.

---

## Troubleshooting

### `uvicorn not recognized`
Always start via `start_backend.bat` which uses `python -m uvicorn` internally.
Or run manually:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### PowerShell won't activate venv
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Registration fails / 500 error
Check the backend terminal for the exact error. Common causes:
- Wrong database password in `.env`
- PostgreSQL not running (check Windows Services)
- Database `shopkenya` not created yet

### Login fails with 401
- Make sure you registered first (the account must exist in the DB)
- Email and password are case-sensitive for the password

### CORS error in browser
Make sure both servers are running:
- Backend on port **8000**
- Frontend on port **3000**

### Database connection refused
PostgreSQL service might not be running. Open Windows Services (search `services.msc`) and start `postgresql-x64-XX`.

---

## Project Structure
```
shopkenya/
├── backend/
│   ├── main.py              ← FastAPI app (auto-creates tables)
│   ├── database.py          ← PostgreSQL connection
│   ├── models/__init__.py   ← Database tables
│   ├── schemas/__init__.py  ← Request/response validation
│   ├── routers/
│   │   ├── auth.py          ← POST /auth/register  POST /auth/login
│   │   ├── products.py      ← GET/POST/PUT/DELETE /products
│   │   ├── cart.py          ← Cart operations
│   │   ├── orders.py        ← Order creation
│   │   ├── payment.py       ← M-Pesa STK Push
│   │   └── admin.py         ← Admin dashboard data
│   ├── utils/auth.py        ← JWT + bcrypt
│   ├── utils/mpesa.py       ← Daraja API
│   ├── .env                 ← Your credentials (already filled in)
│   ├── start_backend.bat    ← Double-click to start
│   └── make_admin.bat       ← Make a user admin
│
└── frontend/
    ├── src/
    │   ├── pages/           ← All page components
    │   ├── components/      ← Navbar, ProductCard, AnimatedBackground
    │   ├── context/         ← Auth + Cart state
    │   └── utils/api.js     ← All API calls
    ├── .env                 ← REACT_APP_API_URL=http://localhost:8000
    └── start_frontend.bat   ← Double-click to start
```

## Bugs Fixed in This Version
1. **Registration 500 error** — `UserOut.from_orm()` (Pydantic v1) replaced with `UserOut.model_validate()` (Pydantic v2)
2. **Login 401 error** — JWT `sub` field was stored as int, now stored as string (JWT spec requirement)
3. **uvicorn not found** — Startup scripts now use `python -m uvicorn` which always works
4. **Tables not created** — `Base.metadata.create_all()` runs on every startup automatically
5. **Database connection errors** — Added clear error messages showing exactly what to fix

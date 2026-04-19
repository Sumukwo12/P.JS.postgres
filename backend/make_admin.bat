@echo off
title Make Admin
cd /d "%~dp0"
echo.
echo  =============================================
echo    Make a user Admin
echo  =============================================
echo.
set /p EMAIL="Enter the user's email address: "
echo.
call venv\Scripts\activate.bat
python -c "
from database import SessionLocal
from models import User
db = SessionLocal()
user = db.query(User).filter(User.email == '%EMAIL%').first()
if user:
    user.is_admin = True
    db.commit()
    print('SUCCESS: ' + user.name + ' is now an admin.')
    print('They can log in at http://localhost:3000/admin')
else:
    print('ERROR: No user found with email: %EMAIL%')
    print('Make sure they have registered first.')
db.close()
"
echo.
pause

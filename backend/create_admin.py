
from getpass import getpass

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User


db = SessionLocal()

try:
    email = input("Enter admin email: ").strip().lower()

    if db.query(User).filter(User.email == email).first():
        print("This email already exists. No account was changed.")
    else:
        password = getpass("Enter admin password (minimum 8 characters): ")

        if len(password) < 8:
            print("Password must contain at least 8 characters.")
        else:
            confirm_password = getpass("Confirm admin password: ")

            if password != confirm_password:
                print("Passwords do not match.")
            else:
                admin = User(
                    email=email,
                    hashed_password=hash_password(password),
                    role="admin",
                    is_active=True
                )

                db.add(admin)
                db.commit()

                print("Admin account created successfully.")

finally:
    db.close()
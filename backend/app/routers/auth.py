
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt import InvalidTokenError
from sqlalchemy.orm import Session


from app.core.database import get_db
from app.core.security import (
    ALGORITHM,
    SECRET_KEY,
    create_access_token,
    hash_password,
    verify_password
)
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


@router.post("/register", response_model=UserResponse)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    # Public registration can create operators only.
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email is already registered"
        )

    user = User(
        email=str(user_data.email),
        hashed_password=hash_password(user_data.password),
        role="operator",
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=Token)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # OAuth2 form field "username" will contain the email.
    user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if (
        user is None
        or not verify_password(
            form_data.password,
            user.hashed_password
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    access_token = create_access_token(str(user.id))

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired access token",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        import jwt

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_error

        user_id = int(user_id)

    except (InvalidTokenError, ValueError, TypeError):
        raise credentials_error

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if user is None or not user.is_active:
        raise credentials_error

    return user


def require_roles(*allowed_roles):
    def role_checker(
        current_user: User = Depends(get_current_user)
    ):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )

        return current_user

    return role_checker


@router.get("/me", response_model=UserResponse)
def read_my_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.get("/admin-only")
def admin_only(
    current_user: User = Depends(require_roles("admin"))
):
    return {
        "message": "Welcome, admin!",
        "email": current_user.email,
        "role": current_user.role
    }


@router.get("/manager-only")
def manager_only(
    current_user: User = Depends(
        require_roles("admin", "manager")
    )
):
    return {
        "message": "Welcome to the management area",
        "email": current_user.email,
        "role": current_user.role
    }

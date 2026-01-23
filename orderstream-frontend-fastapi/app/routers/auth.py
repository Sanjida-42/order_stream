from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import uuid
import shutil

from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate, UserLogin, Token, UserResponse, UserProfile, PasswordReset, UserProfileUpdate
)
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

UPLOAD_DIR = "uploads/profiles"

@router.post("/profile/upload")
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and save profile image"""
    # Create directory if it doesn't exist
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG and WEBP images are allowed"
        )
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    if not file_ext:
        file_ext = ".jpg" # Default extension
    
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}"
        )
    
    # Update user's profile image URL
    # We store the relative path for the frontend to use with the base API URL
    image_url = f"/uploads/profiles/{filename}"
    current_user.profile_image_url = image_url
    db.commit()
    
    return {
        "message": "Image uploaded successfully",
        "profile_image_url": image_url
    }

# Security settings
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 30


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        # Validate password length
        if len(user_data.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long"
            )
        
        # Check if user exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already exists"
            )
        
        # Hash password with error handling
        try:
            hashed_password = get_password_hash(user_data.password)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Password hashing failed: {str(e)}"
            )
        
        # Create new user
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            password=hashed_password,
            phone=user_data.phone,
            address=user_data.address,
            profile_image_url=user_data.profile_image_url,
            is_active=True,
            is_verified=False
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Create access token
        token = create_access_token(data={"id": new_user.id})
        
        return {
            "token": token,
            "user": UserResponse(
                id=new_user.id,
                name=new_user.name,
                email=new_user.email,
                phone=new_user.phone,
                address=new_user.address,
                role=new_user.role.value,
                profile_image_url=new_user.profile_image_url
            )
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    try:
        # Find user
        user = db.query(User).filter(User.email == credentials.email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid credentials"
            )
        
        # Check if account is locked
        if user.locked_until and user.locked_until > datetime.utcnow():
            mins_remaining = int((user.locked_until - datetime.utcnow()).total_seconds() / 60)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account locked. Try again in {mins_remaining} minutes"
            )
        
        # Check if account is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated. Contact support."
            )
        
        # Verify password
        if not verify_password(credentials.password, user.password):
            # Increment failed login attempts
            user.failed_login_attempts += 1
            
            if user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS:
                user.locked_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Too many failed attempts. Account locked for {LOCKOUT_DURATION_MINUTES} minutes"
                )
            
            db.commit()
            remaining = MAX_LOGIN_ATTEMPTS - user.failed_login_attempts
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid credentials. {remaining} attempts remaining"
            )
        
        # Successful login - reset failed attempts and update last login
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login = datetime.utcnow()
        db.commit()
        
        # Create access token
        token = create_access_token(data={"id": user.id})
        
        return {
            "token": token,
            "user": UserResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                phone=user.phone,
                address=user.address,
                role=user.role.value,
                profile_image_url=user.profile_image_url
            )
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.get("/profile", response_model=UserProfile)
def get_profile(current_user: User = Depends(get_current_user)):
    return UserProfile(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        address=current_user.address,
        role=current_user.role.value,
        profile_image_url=current_user.profile_image_url,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        last_login=current_user.last_login
    )


@router.put("/profile")
def update_profile(
    user_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user profile"""
    if user_data.name:
        current_user.name = user_data.name
    if user_data.phone:
        current_user.phone = user_data.phone
    if user_data.address is not None:
        current_user.address = user_data.address
    if user_data.profile_image_url is not None:
        current_user.profile_image_url = user_data.profile_image_url
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Profile updated successfully",
        "user": UserResponse(
            id=current_user.id,
            name=current_user.name,
            email=current_user.email,
            phone=current_user.phone,
            address=current_user.address,
            role=current_user.role.value,
            profile_image_url=current_user.profile_image_url
        )
    }


@router.post("/change-password")
def change_password(
    password_data: PasswordReset,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change user password"""
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Hash new password
    current_user.password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}
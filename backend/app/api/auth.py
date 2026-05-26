from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status
from app.database import get_db
from app.models import User
from app.schemas import Token,CreateUserRequest
import bcrypt, uuid
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError


router = APIRouter(prefix='/auth',tags=['auth'])

SECRET_KEY = 'yahoo888'
ALGORITHM = 'HS256'

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/token')


db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/register",status_code=status.HTTP_201_CREATED)#register
async def create_user(db: Annotated[Session, Depends(get_db)], create_user_request: CreateUserRequest):
    
    existing_user = db.query(User).filter(User.email == create_user_request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    password_bytes = create_user_request.password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)

    create_user_model = User(
        username=create_user_request.username,
        email=create_user_request.email,
        hashed_password=hashed_password.decode('utf-8'),
        role="user"
    )

    db.add(create_user_model)
    db.commit()
    return {"message": "User created successfully"}

@router.post("/login", response_model=Token)#login
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 db: db_dependency):
    
    user = authenticate_user(form_data.username, form_data.password, db) #form_data.username = email
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail='Could not validate user')

    token = create_access_token(user.username,user.id, user.role, timedelta(minutes=20))
    return {'access_token':token, 'token_type': 'bearer','role': user.role}

def authenticate_user(email: str, password: str, db):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
    if not bcrypt.checkpw(password.encode('utf-8'), user.hashed_password.encode('utf-8')):
        return False
    return user 

def create_access_token(username: str, user_id: uuid.UUID,role: str, expires_delta: timedelta):
    encode = {'sub':username, 'id':str(user_id),'role': role}
    expires = datetime.now()+expires_delta
    encode.update({'exp':expires})
    return jwt.encode(encode,SECRET_KEY,algorithm=ALGORITHM)

#เช็ค token    
async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY,algorithms=ALGORITHM)
        username: str = payload.get("sub")
        # print(username)
        user_id: int = payload.get("id")
        user_role: str = payload.get("role")
        if username is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail='Could not validate user')
        
        return {'username': username, 'id':user_id,"role": user_role}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate iser')
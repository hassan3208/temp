from fastapi import FastAPI, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from typing import Annotated
from datetime import timedelta
from fastapi.middleware.cors import CORSMiddleware
import models, schemas, crud, auth, database

models.Base.metadata.create_all(bind=database.engine)


origins = [
    "http://localhost:8080",  # your frontend URL
    "http://127.0.0.1:8080",  # If using Vite
    # Add your deployed frontend URL later
]

app = FastAPI(title='User Management API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)






# Signup
@app.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(auth.get_db)):
    db_user = crud.get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_email = crud.get_user_by_email(db, user.email)
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user)

# Signin (login)
@app.post("/signin", response_model=schemas.Token)
async def signin(
    form_data: Annotated[auth.OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(auth.get_db),
):
    user = await auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return schemas.Token(access_token=access_token, token_type="bearer")

# Protected route
@app.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(
    current_user: Annotated[schemas.UserResponse, Depends(auth.get_current_active_user)]
):
    return current_user


@app.put("/users/me", response_model=schemas.UserResponse)
async def update_my_profile(
    updates: schemas.UserUpdate,
    db: Session = Depends(auth.get_db),
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user)
):
    db_user = crud.get_user_by_username(db, current_user.username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    updated_user = crud.update_user(db, db_user, updates)
    return updated_user



@app.get("/")
def read_root():
    return {"message": "Server is running!"}

from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class QuizBase(BaseModel):
    title: str
    description: str
    time_limit: Optional[int] = None

class QuestionCreate(BaseModel):
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str  # validate to be in a/b/c/d

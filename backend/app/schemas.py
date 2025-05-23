from pydantic import BaseModel, EmailStr
from typing import List, Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class QuestionCreate(BaseModel):
    text: str
    option_a: str
    option_b: str
    option_c: Optional[str]
    option_d: Optional[str]
    correct_option: str  # validate to be in a/b/c/d


class QuizCreate(BaseModel):
    title: str
    description: Optional[str]
    time_limit: Optional[int] = None
    questions: List[QuestionCreate]

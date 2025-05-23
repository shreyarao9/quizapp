from pydantic import BaseModel, EmailStr, model_validator
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
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_option: str  # validate to be in a/b/c/d

    @model_validator(mode="after")
    def check_correct_option(self):
        options = {
            "a": self.option_a,
            "b": self.option_b,
            "c": self.option_c,
            "d": self.option_d,
        }

        if self.correct_option not in options:
            raise ValueError(
                "correct_option must be one of 'a', 'b', 'c', or 'd'")

        if not options[self.correct_option]:
            raise ValueError(f"Correct option '{
                             self.correct_option}' has no content")

        return self


class QuizCreate(BaseModel):
    title: str
    description: Optional[str]
    time_limit: Optional[int] = None
    questions: List[QuestionCreate]


class AnswerSubmit(BaseModel):
    question_id: int
    selected_option: str


class AttemptSubmit(BaseModel):
    answers: List[AnswerSubmit]


class AnswerReview(BaseModel):
    question: str
    selected: str
    correct: str


class AttemptResult(BaseModel):
    score: int
    total: int
    review: List[AnswerReview]

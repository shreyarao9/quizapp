from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)


class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String)
    time_limit = Column(Integer, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"))
    questions = relationship(
        "Question", back_populates="quiz", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    text = Column(String, nullable=False)
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=True)
    option_d = Column(String, nullable=True)
    correct_option = Column(String, nullable=False)  # 'a', 'b', 'c', 'd'
    quiz = relationship("Quiz", back_populates="questions")


class Attempt(Base):
    __tablename__ = "attempts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    score = Column(Integer)
    total = Column(Integer)

    user = relationship("User")
    quiz = relationship("Quiz")


class Answer(Base):
    __tablename__ = "answers"
    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    selected_option = Column(String)

    attempt = relationship("Attempt", back_populates="answers")
    question = relationship("Question")


Attempt.answers = relationship(
    "Answer", back_populates="attempt", cascade="all, delete-orphan")

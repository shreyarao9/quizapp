from fastapi import FastAPI
from .routers import users, quizzes
from .database import Base, engine

app = FastAPI()

# Initialize tables
Base.metadata.create_all(bind=engine)

# Include routes
app.include_router(users.router)
app.include_router(quizzes.router)

# import os
from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from .routers import users, quizzes
from .database import Base, engine

# load_dotenv()  # Load variables from .env

# origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # [origin.strip() for origin in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize tables
Base.metadata.create_all(bind=engine)

# Include routes
app.include_router(users.router)
app.include_router(quizzes.router)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Quiz API",
        version="1.0.0",
        description="API for quiz platform",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "HTTPBearer": {
            "type": "http",
            "scheme": "bearer"
        }
    }
    for path in openapi_schema["paths"].values():
        for operation in path.values():
            operation["security"] = [{"HTTPBearer": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

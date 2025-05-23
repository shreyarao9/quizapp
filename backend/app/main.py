from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from .routers import users, quizzes
from .database import Base, engine

app = FastAPI()

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

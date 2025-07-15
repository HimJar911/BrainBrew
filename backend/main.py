from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.openapi.utils import get_openapi
from routes import auth, game, pattern, binary, chunk, stroop, dual, pattern_analysis
from database import create_db_and_tables
from dotenv import load_dotenv

load_dotenv()
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

load_dotenv()
app = FastAPI(
    title="BrainBrew API",
    version="1.0.0",
    description="Backend for BrainBrew cognitive training platform",
    lifespan=lifespan
)

# Include routes
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(game.router, prefix="/game", tags=["Game"])
app.include_router(pattern.router, prefix="/pattern", tags=["Pattern Memory Matrix"])
app.include_router(binary.router, prefix="/binary")
app.include_router(chunk.router)
app.include_router(stroop.router)
app.include_router(dual.router, prefix="/dual", tags=["Dual N-Back"])
app.include_router(pattern_analysis.router)

# Root route
@app.get("/")
def root():
    return {"message": "BrainBrew backend is running"}

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    # Inject HTTPBearer security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "HTTPBearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    # Apply to all routes requiring security
    for path in openapi_schema["paths"].values():
        for operation in path.values():
            operation["security"] = [{"HTTPBearer": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
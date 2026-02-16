from fastapi import FastAPI
from app.database import engine, Base
from app.api import tickets
from fastapi.middleware.cors import CORSMiddleware
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Helpdesk Ticket API")
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(tickets.router, prefix="/api", tags=["Tickets"])

@app.get("/")
def root():
    return {"message": "Server is running"}
#docker start helpdesk-postgres
#docker stop helpdesk-postgres
#.venv\Scripts\activate
#uvicorn app.main:app --reload
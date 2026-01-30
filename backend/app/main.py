from fastapi import FastAPI
from app.database import engine, Base
from app.api import tickets

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Helpdesk Ticket API")

app.include_router(tickets.router, prefix="/api", tags=["Tickets"])


#docker start helpdesk-postgres
#docker stop helpdesk-postgres
#.venv\Scripts\activate
#uvicorn app.main:app --reload
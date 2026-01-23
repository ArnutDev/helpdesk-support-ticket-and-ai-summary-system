from fastapi import FastAPI
from .database import engine, Base
from .api import tickets

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Helpdesk Ticket API")

app.include_router(tickets.router, prefix="/api", tags=["Tickets"])


#docker start helpdesk-postgres
#docker stop helpdesk-postgres
#.venv\Scripts\activate
#uvicorn main:app --reload
from fastapi import FastAPI
from app.database import engine, Base
from app.api import tickets,auth

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
app.include_router(tickets.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Server is running"}
#docker start helpdesk-postgres
#docker stop helpdesk-postgres
#.venv\Scripts\activate
#uvicorn app.main:app --reload

# login admin
# username: admin
# password: 123

# ตั้งuser ให้เป็น admin
# สมัครปกติก่อน แล้วค่อย
# docker exec -it helpdesk-postgres psql -U postgres -d postgres -c "UPDATE users SET role = 'admin' WHERE username = 'ใส่ username'"
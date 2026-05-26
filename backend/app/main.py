from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database import engine, Base
from app.api import tickets,auth
from app.database import seed_admin
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # โค้ดในบล็อกนี้จะทำงาน "ทันที" ที่เราพิมพ์ uvicorn สตาร์ทระบบ
    print("เซิร์ฟเวอร์กำลังสตาร์ท...")
    seed_admin() #เพิ่มแอดมินตอนเริ่มระบบ
    yield
    print("เซิร์ฟเวอร์กำลังปิดตัวลง...")

app = FastAPI(lifespan=lifespan, title="Helpdesk Ticket API")

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

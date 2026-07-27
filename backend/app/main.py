from app.api import summary
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from contextlib import asynccontextmanager
from app.database import engine, Base
from app.api import tickets,auth,users
from app.database import seed_admin
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # โค้ดในบล็อกนี้จะทำงาน "ทันที" ที่เราพิมพ์ uvicorn สตาร์ทระบบ
    print("เซิร์ฟเวอร์กำลังสตาร์ท...")
    try:
        Base.metadata.create_all(bind=engine)
        seed_admin() #เพิ่มแอดมินตอนเริ่มระบบ
    except Exception as e:
        print(f"เกิดข้อผิดพลาดในการสร้างตารางหรือ Seeding: {e}")
    yield
    print("เซิร์ฟเวอร์กำลังปิดตัวลง...")

app = FastAPI(lifespan=lifespan, title="Helpdesk Ticket API")

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    print(f"Database error occurred: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "เกิดข้อผิดพลาดกับระบบฐานข้อมูล กรุณาลองใหม่อีกครั้ง"}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled server error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง"}
    )

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://helpdesk-support-ticket-and-ai-summ.vercel.app"
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
app.include_router(users.router)
app.include_router(summary.router)

@app.get("/")
def root():
    return {"message": "Server is running"}
#docker start helpdesk-postgres
#docker stop helpdesk-postgres
#.venv\Scripts\activate
#uvicorn app.main:app --reload

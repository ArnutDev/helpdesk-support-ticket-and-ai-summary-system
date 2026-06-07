# app/test/conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from fastapi.testclient import TestClient

# ชี้ URL ไปหาพอร์ต 5433 และระบุชื่อดีบีเทสที่เราเพิ่งตั้งใน Docker Compose
SQLALCHEMY_TEST_DATABASE_URL = "postgresql://postgres:password@localhost:5433/test_helpdesk_db"

@pytest.fixture(scope="function")
def client(db_session):
    """
    สร้างตัวยิง Request จำลอง (TestClient)
    และทำการสลับท่อฐานข้อมูล (Dependency Override) ให้วิ่งมาหาดีบีเทสพอร์ต 5433
    """
    def _get_test_db():
        try:
            yield db_session
        finally:
            pass

    # สลับสายท่อน้ำของ FastAPI จากดีบีจริงมาเป็นดีบีเทส
    app.dependency_overrides[get_db] = _get_test_db
    
    # เปิดเครื่องเครื่องมือยิงหน้าบ้านจำลอง
    with TestClient(app) as test_client:
        yield test_client
        
    # ล้างค่าการสลับสายหลังจากเทสเคสนั้น ๆ รันเสร็จสิ้น
    app.dependency_overrides.clear()

@pytest.fixture(scope="session")
def engine():
    # ใช้ดีบีของ Postgres จริง ๆ ในการทดสอบ
    engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL)
    
    Base.metadata.create_all(bind=engine)
    yield engine
    # เทสเสร็จหมดทุกข้อ ล้างตารางทิ้งให้คลีนเพื่อรอการเทสรอบถัดไป
    Base.metadata.drop_all(bind=engine)

# 🚨 ก๊อปปี้ท่อนนี้แปะต่อท้ายเข้าไปเลยครับคุณนัด
@pytest.fixture(scope="function")
def db_session(engine):
    """
    สร้าง Session สำหรับแต่ละฟังก์ชันเทส 
    รันเสร็จปุ๊บสั่ง Rollback ทันที ข้อมูลจะได้ไม่ตีกันระหว่างเคส
    """
    connection = engine.connect()
    transaction = connection.begin()
    
    Session = sessionmaker(bind=connection)
    session = Session()

    yield session  # ➡️ ส่งตัวนี้ไปเข้าวงเล็บฟังก์ชันใน test_llm_summary_filter.py

    session.close()
    transaction.rollback()
    connection.close()
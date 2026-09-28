from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,Session, declarative_base
import os
from dotenv import load_dotenv
import bcrypt


# DATABASE_URL = "postgresql://postgres:password@localhost:5432/helpdesk_db"
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Handle postgres:// connection strings from providers like Supabase
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# In serverless environments, pool_pre_ping and pool_recycle help prevent dropped connection errors
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300
) if DATABASE_URL else None

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
) if engine else None

Base = declarative_base()

def get_db():
    if not SessionLocal:
        raise RuntimeError("DATABASE_URL is not configured or engine failed to initialize.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_admin():
    if not SessionLocal:
        print("ข้ามการสร้าง Admin: SessionLocal ยังไม่พร้อมใช้งาน")
        return
    db: Session = SessionLocal()
    from app.models import User

    try:
        admin_email = os.getenv("ADMIN_EMAIL")
        admin_username = os.getenv("ADMIN_USERNAME", "SuperAdmin")
        admin_password = os.getenv("ADMIN_PASSWORD")

        # ป้องกันกรณีลืมกรอกค่าใน .env
        if not admin_email or not admin_password:
            print("ข้ามการสร้าง Admin: ไม่พบ ADMIN_EMAIL หรือ ADMIN_PASSWORD ใน .env")
            return
        
        admin_exists = db.query(User).filter(User.email == admin_email).first()

        if not admin_exists: 
            print("ไม่พบบัญชี Admin... กำลังสร้างบัญชีแรกสุดอัตโนมัติ...")
            password_bytes = admin_password.encode('utf-8')
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(password_bytes, salt)

            admin_user = User(
                username=admin_username,
                email=admin_email,
                hashed_password=hashed_password.decode('utf-8'),
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print(f"Admin user created: {admin_email}")
        else:
            print(f"Admin user already exists: {admin_email}")
    except Exception as e:
        print(f"เกิดข้อผิดพลาดในการรัน Data Seeding: {e}")    
    finally:
        db.close()
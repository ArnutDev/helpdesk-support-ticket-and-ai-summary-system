from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from app.api.auth import require_admin
from typing import List, Optional
from app.models import User
from app.schemas import RoleUpdate, UserOut

router = APIRouter(prefix="/admin", tags=["Users"])

@router.get("/users", response_model=list[UserOut])#กำหนดรูปแบบ เอามาเป็น list ของ UserResponse
def get_all_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    # ดึงรายชื่อยูสเซอร์ทุกคนในตารางเพื่อส่งไปให้หน้าบ้านโชว์ใน List
    return db.query(User).all()
    
@router.put("/update-role")
async def update_user_role(
    payload: RoleUpdate, 
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    target_user = db.query(User).filter(User.id == payload.user_id).first()
    
    if not target_user:
        raise HTTPException(status_code=404, detail="ไม่พบผู้ใช้งานรายนี้ในระบบ")
    
    current_admin_email = admin.get("email") 

    if target_user.email == current_admin_email:
        #ถ้าพยายามจะเปลี่ยนตัวเองจาก admin ไปเป็น user
        if target_user.role == "admin" and payload.new_role == "user":
            # ไปนับจำนวนแอดมินทั้งหมดที่มีอยู่ในระบบตอนนี้
            admin_count = db.query(User).filter(User.role == "admin").count()
            
            # ถ้าเหลือแอดมินอยู่คนเดียว (ซึ่งก็คือตัวเอง) ห้ามลดสิทธิ์เด็ดขาด ไม่งั้นระบบจะไม่มีแอดมินดูแล
            if admin_count <= 1:
                raise HTTPException(
                    status_code=400, 
                    detail="ไม่สามารถลดสิทธิ์ตัวเองได้ เนื่องจากคุณเป็นแอดมินคนสุดท้ายในระบบ"
                )

    target_user.role = payload.new_role
    db.commit()
    db.refresh(target_user)
    
    return {
        "status": "success",
        "message": f"เปลี่ยนสิทธิ์ของ {target_user.username} เป็น {target_user.role} สำเร็จแล้ว",
        "user_id": target_user.id,
        "role": target_user.role
    }
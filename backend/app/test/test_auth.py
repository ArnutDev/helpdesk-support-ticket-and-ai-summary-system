# app/test/test_auth.py
import pytest
import bcrypt
import uuid
from datetime import timedelta
from fastapi import HTTPException
from app.models import User
from app.api.auth import create_access_token, get_current_user, require_admin

# เทสระบบสมัครสมาชิก (Register)
def test_register_user_successfully(client):
    payload = {
        "username": "arnut_dev",
        "email": "arnut.buadonpai@gmail.com",
        "password": "supersecurepassword123",
        "confirm_password": "supersecurepassword123"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    assert response.json() == {"message": "User created successfully"}

def test_register_duplicate_email_should_fail(client, db_session):
    existing_user = User(
        id=uuid.uuid4(),
        username="old_user",
        email="arnut.buadonpai@gmail.com",
        hashed_password=bcrypt.hashpw(b"123", bcrypt.gensalt()).decode('utf-8'),
        role="user"
    )
    db_session.add(existing_user)
    db_session.commit()

    payload = {
        "username": "new_nut",
        "email": "arnut.buadonpai@gmail.com",
        "password": "password123",
        "confirm_password": "password123"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 400
    assert "Email already exists" in response.json()["detail"]


# 2. เทสระบบเข้าสู่ระบบและการออก Token (Login)
def test_login_success_returns_token(client, db_session):
    raw_password = "password123"
    hashed = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    test_user = User(
        id=uuid.uuid4(),
        username="nut_login",
        email="login@example.com",
        hashed_password=hashed,
        role="user"
    )
    db_session.add(test_user)
    db_session.commit()

    form_data = {
        "username": "login@example.com",
        "password": raw_password
    }
    response = client.post("/auth/login", data=form_data)
    assert response.status_code == 200
    json_data = response.json()
    assert "access_token" in json_data
    assert json_data["token_type"] == "bearer"
    assert json_data["role"] == "user"


#  3. เทสระบบถอดรหัสและตรวจสิทธิ์ (JWT & Roles)
@pytest.mark.anyio
async def test_get_current_user_valid_token():
    """แกะโทเค็นที่ถูกต้อง ข้อมูลต้องถอดออกมาครบถ้วน"""
    user_id = uuid.uuid4()
    # ปั๊ม Token ขึ้นมาดื้อ ๆ
    token = create_access_token("arnut@test.com", "arnut_dev", user_id, "user", timedelta(minutes=10))
    
    # สั่งรันฟังก์ชันตรวจสอบ Token ตรง ๆ (เนื่องจากเป็น async ต้องมี await)
    current_user = await get_current_user(token=token)
    
    assert current_user["email"] == "arnut@test.com"
    assert current_user["role"] == "user"
    assert current_user["id"] == str(user_id)

@pytest.mark.anyio
async def test_get_current_user_invalid_token_should_raise_error():
    """ถ้าส่ง Token ขยะหรือมั่วมา ต้องพ่น HTTPException 401 ทันที"""
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(token="invalid_token_hahaha")
    
    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Could not validate user"


#  4. ดักคอมาเฟีย แอบอ้างสิทธิ์ Admin (require_admin)
def test_require_admin_with_normal_user_should_raise_forbidden(db_session):
    """ยูสเซอร์ทั่วไป แต่อยากห้าวมาเข้าประตูด่านแอดมิน โดนตบกลับด้วย 403"""
    user_id = uuid.uuid4()
    # ยัดคนธรรมดาลงฐานข้อมูลเทส
    normal_user = User(id=user_id, username="normal_nut", email="user@test.com", hashed_password="...", role="user")
    db_session.add(normal_user)
    db_session.commit()

    current_user_payload = {"id": user_id, "username": "normal_nut", "role": "user"}

    # สั่งรันฟังก์ชัน require_admin เช็คเงื่อนไขหลังบ้านจริง
    with pytest.raises(HTTPException) as exc_info:
        require_admin(current_user=current_user_payload, db=db_session)
        
    assert exc_info.value.status_code == 403
    assert "สิทธิ์ของคุณถูกเปลี่ยนแปลง" in exc_info.value.detail

def test_require_admin_with_real_admin_should_pass(db_session):
    """แอดมินตัวจริง เสียงจริง ต้องผ่านเข้าประตูด้านในได้สบายใจ"""
    admin_id = uuid.uuid4()
    # ยัดมาเฟียใหญ่ (Admin) ลงฐานข้อมูลเทส
    admin_user = User(id=admin_id, username="big_boss", email="admin@test.com", hashed_password="...", role="admin")
    db_session.add(admin_user)
    db_session.commit()

    current_user_payload = {"id": admin_id, "username": "big_boss", "role": "admin"}

    # รันฟังก์ชัน คาดหวังว่าต้องไม่มี Exception และยอมรีเทิร์นข้อมูลผู้ใช้กลับมา
    result = require_admin(current_user=current_user_payload, db=db_session)
    assert result["role"] == "admin"
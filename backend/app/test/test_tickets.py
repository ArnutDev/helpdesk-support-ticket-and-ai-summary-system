# app/test/test_auth.py
import pytest
import bcrypt
import uuid
from datetime import timedelta
from fastapi import HTTPException
from app.models import User
from app.api.auth import create_access_token, get_current_user, require_admin

# เทสสร้างตั๋วใหม่ ต้องได้สถานะเป็น pending ทันที
def test_user_create_ticket_successfully_should_be_pending(client, db_session):

    # สร้าง user ลง db
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

    # loginเข้าไปเพื่อเอา token
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

    # เอา token ไปสร้างตั๋วใหม่
    token = json_data["access_token"]
    ticket_form = {
        "title": "Test Ticket",
        "description": "This is a test ticket",
        "contact_info": "911",
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/tickets", json=ticket_form, headers=headers)
    response_json = response.json()
    assert response.status_code == 200
    assert response_json["title"] == "Test Ticket"
    assert response_json["description"] == "This is a test ticket"
    assert response_json["contact_info"] == "911"
    assert response_json["status"] == "pending"

def test_admin_change_ticket_status(client, db_session):

    # สร้าง user ลง db
    raw_password = "password123"
    hashed = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user_id = uuid.uuid4()
    test_user = User(
        id=user_id,
        username="nut_login",
        email="login@example.com",
        hashed_password=hashed,
        role="user"
    )
    db_session.add(test_user)
    db_session.commit()

    # loginเข้าไปเพื่อเอา token
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

    # เอา token ไปสร้างตั๋วใหม่
    token = json_data["access_token"]
    ticket_form = {
        "title": "Test Ticket",
        "description": "This is a test ticket",
        "contact_info": "911",
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/tickets", json=ticket_form, headers=headers)
    response_json = response.json()
    assert response.status_code == 200
    assert response_json["title"] == "Test Ticket"
    assert response_json["description"] == "This is a test ticket"
    assert response_json["contact_info"] == "911"
    assert response_json["status"] == "pending"

    # สร้าง admin ลง db
    raw_password = "password888"
    hashed = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    test_user = User(
        id=uuid.uuid4(),
        username="nut_admin_login",
        email="admin@example.com",
        hashed_password=hashed,
        role="admin"
    )
    db_session.add(test_user)
    db_session.commit()

    # loginเข้าไปเพื่อเอา token
    form_data = {
        "username": "admin@example.com",
        "password": raw_password
    }
    response = client.post("/auth/login", data=form_data)
    assert response.status_code == 200
    json_data = response.json()
    assert "access_token" in json_data
    assert json_data["token_type"] == "bearer"
    assert json_data["role"] == "admin"

    # เอา token ให้แอดมินไปเปลี่ยนสถานะตั๋ว 
    token = json_data["access_token"]

    #ให้แอดมินไปเปลี่ยนสถานะตั๋ว จาก pending เป็น accepted
    status_accept = {
        "new_status": "accepted"
    }
    headers = {"Authorization": f"Bearer {token}"}
    ticket_id = response_json["id"] #ดึง id ของตั๋วที่สร้างขึ้นมา
    response = client.patch(f"/tickets/{ticket_id}/status", params=status_accept, headers=headers)
    response_json = response.json()
    assert response.status_code == 200
    assert response_json["status"] == "accepted"


def test_admin_change_ticket_status_should_raise_error(client, db_session):

    # สร้าง user ลง db
    raw_password = "password123"
    hashed = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user_id = uuid.uuid4()
    test_user = User(
        id=user_id,
        username="nut_login",
        email="login@example.com",
        hashed_password=hashed,
        role="user"
    )
    db_session.add(test_user)
    db_session.commit()

    # loginเข้าไปเพื่อเอา token
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

    # เอา token ไปสร้างตั๋วใหม่
    token = json_data["access_token"]
    ticket_form = {
        "title": "Test Ticket",
        "description": "This is a test ticket",
        "contact_info": "911",
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/tickets", json=ticket_form, headers=headers)
    response_json = response.json()
    assert response.status_code == 200
    assert response_json["title"] == "Test Ticket"
    assert response_json["description"] == "This is a test ticket"
    assert response_json["contact_info"] == "911"
    assert response_json["status"] == "pending"
    ticket_id = response_json["id"] #ดึง id ของตั๋วที่สร้างขึ้นมา

    # สร้าง admin ลง db
    raw_password = "password888"
    hashed = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    test_user = User(
        id=uuid.uuid4(),
        username="nut_admin_login",
        email="admin@example.com",
        hashed_password=hashed,
        role="admin"
    )
    db_session.add(test_user)
    db_session.commit()

    # loginเข้าไปเพื่อเอา token
    form_data = {
        "username": "admin@example.com",
        "password": raw_password
    }
    response = client.post("/auth/login", data=form_data)
    assert response.status_code == 200
    json_data = response.json()
    assert "access_token" in json_data
    assert json_data["token_type"] == "bearer"
    assert json_data["role"] == "admin"

    # เอา token ให้แอดมินไปเปลี่ยนสถานะตั๋ว 
    token = json_data["access_token"]

    # ต้องเปลี่ยนสถานะเป็น accepted ก่อนถึงจะไปเปลี่ยนเป็น resolved หรือ rejected ได้
    status_resolved = {
        "new_status": "resolved"
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = client.patch(f"/tickets/{ticket_id}/status", params=status_resolved, headers=headers)
    response_json = response.json()
    assert response.status_code == 400
    assert response_json["detail"] == "Must be accepted before closing"

    status_rejected = {
        "new_status": "rejected"
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = client.patch(f"/tickets/{ticket_id}/status", params=status_rejected, headers=headers)
    response_json = response.json()
    assert response.status_code == 400
    assert response_json["detail"] == "Must be accepted before closing"

    # ขอ accept ปกติ
    status_accept = {
        "new_status": "accepted"
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = client.patch(f"/tickets/{ticket_id}/status", params=status_accept, headers=headers)
    response_json = response.json()
    assert response.status_code == 200
    assert response_json["status"] == "accepted"

    # ขอ ปิด ticket ปกติ
    status_resolved = {
        "new_status": "resolved"
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = client.patch(f"/tickets/{ticket_id}/status", params=status_resolved, headers=headers)
    response_json = response.json()
    assert response.status_code == 200
    assert response_json["status"] == "resolved"



    #เปลี่ยนสถานะ ticket ที่ปิดไปแล้ว ก่อนหน้านี้ปิดด้วย resolved ไปแล้ว
    status_rejected = {
        "new_status": "rejected"
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = client.patch(f"/tickets/{ticket_id}/status", params=status_rejected, headers=headers)
    response_json = response.json()
    assert response.status_code == 400
    assert response_json["detail"] == "Cannot update a closed ticket!"

    status_accepted = {
        "new_status": "accepted"
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = client.patch(f"/tickets/{ticket_id}/status", params=status_accepted, headers=headers)
    response_json = response.json()
    assert response.status_code == 400
    assert response_json["detail"] == "Cannot update a closed ticket!"

# ใน tickets.pyมี elif raise ที่ไม่จำเป็นอยู่มาก


def test_user_try_to_change_ticket_status_should_raise_exception(client, db_session):

    # สร้าง user ลง db
    raw_password = "password123"
    hashed = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user_id = uuid.uuid4()
    test_user = User(
        id=user_id,
        username="nut_login",
        email="login@example.com",
        hashed_password=hashed,
        role="user"
    )
    db_session.add(test_user)
    db_session.commit()

    # loginเข้าไปเพื่อเอา token
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

    # เอา token ไปสร้างตั๋วใหม่
    token = json_data["access_token"]
    ticket_form = {
        "title": "Test Ticket",
        "description": "This is a test ticket",
        "contact_info": "911",
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/tickets", json=ticket_form, headers=headers)
    response_json = response.json()
    assert response.status_code == 200
    assert response_json["title"] == "Test Ticket"
    assert response_json["description"] == "This is a test ticket"
    assert response_json["contact_info"] == "911"
    assert response_json["status"] == "pending"
    ticket_id = response_json["id"]

    #ให้ user เนียนไปเปลี่ยนสถานะตั๋ว จาก pending เป็น accepted
    status_accept = {
        "new_status": "accepted"
    }
    headers = {"Authorization": f"Bearer {token}"}
    ticket_id = response_json["id"] #ดึง id ของตั๋วที่สร้างขึ้นมา
    response = client.patch(f"/tickets/{ticket_id}/status", params=status_accept, headers=headers)
    response_json = response.json()
    assert response.status_code == 403
    assert response_json["detail"] == "สิทธิ์ของคุณถูกเปลี่ยนแปลง โปรดเข้าสู่ระบบใหม่อีกครั้ง"
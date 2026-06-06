from pydantic import BaseModel, EmailStr, Field, model_validator
import enum
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel
import uuid
# status
class TicketStatus(enum.Enum):
    pending = "pending"
    accepted = "accepted"
    resolved = "resolved"
    rejected = "rejected"

# รูปแบบticket
class TicketBase(BaseModel):
    title: str
    description: Optional[str] = None
    contact_info: str

# สร้าง เอารูปแบบticketมาใช้
class TicketCreate(TicketBase):
    pass

# อัปเดต ticket
class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    contact_info: Optional[str] = None

# res ticketไปให้user
class TicketResponse(TicketBase):
    id: uuid.UUID
    status: TicketStatus
    created_at: datetime
    updated_at: datetime
    owner_id: uuid.UUID
    class ConfigDict:
        from_attributes = True

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    contact_info: Optional[str] = None
    status: Optional[TicketStatus] = None

class CreateUserRequest(BaseModel):
    username:str = Field(..., min_length=2, max_length=50, description="ชื่อผู้ใช้หรือชื่อแสดงตัวตน")
    email: EmailStr = Field(..., description="อีเมลของผู้ใช้")
    password: str = Field(..., min_length=8, description="รหัสผ่านของผู้ใช้อย่างน้อย 8 ตัวอักษร")
    confirm_password: str

    @model_validator(mode='after')
    def verify_password_match(self):
        if self.password != self.confirm_password:
            raise ValueError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน")
        return self

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class RoleUpdate(BaseModel):
    new_role: str
    user_id: uuid.UUID

class UserOut(BaseModel):
    id: uuid.UUID
    username: str
    email: EmailStr
    role: str

    class ConfigDict:
        from_attributes = True
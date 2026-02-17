from pydantic import BaseModel, EmailStr
import enum
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel

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
    id: UUID
    status: TicketStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    contact_info: Optional[str] = None
    status: Optional[TicketStatus] = None

class CreateUserRequest(BaseModel):
    username:str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
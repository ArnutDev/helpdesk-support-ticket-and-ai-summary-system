import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, Text, DateTime, Enum,Integer,ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from .database import Base

#สถานะ
class TicketStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    resolved = "resolved"
    rejected = "rejected"

#ข้อมูล ticket
class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    title = Column(String(255),nullable=False)
    description = Column(Text,nullable=True)
    contact_info = Column(String(255),nullable=False)
    status = Column(Enum(TicketStatus),default=TicketStatus.pending)
    created_at = Column(DateTime(timezone=True),server_default=func.now())
    updated_at = Column(DateTime(timezone=True),onupdate=func.now(),server_default=func.now())
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="tickets")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String,unique=True)
    hashed_password = Column(String)
    role = Column(String, default="user")
    tickets = relationship("Ticket", back_populates="owner")

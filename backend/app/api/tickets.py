from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from app import models, schemas
from app.database import get_db
from app.api.auth import get_current_user,require_admin
from typing import List, Optional

from uuid import UUID
import enum
router = APIRouter(prefix="", tags=["Tickets"])

@router.post("/tickets",response_model=schemas.TicketResponse) #ตรวจสอบตอนส่งกลับ
def create_ticket(ticket: schemas.TicketCreate,
                  db: Session= Depends(get_db),
                  current_user: dict = Depends(get_current_user)):#ตรวจสอบตอนรับเข้ามา
    # แปลงใส่ model db
    db_ticket = models.Ticket(
        # title=ticket.title,
        # description=ticket.description,
        # contact_info=ticket.contact_info,
        **ticket.model_dump(),#ใช้ model_dump แทนข้างบน
        # status, timestamp ใส่ auto
        owner_id=current_user['id']
    )
    # บันทึก
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket) #ดึงข้อมูลที่เพิ่งสร้าง

    return db_ticket

@router.get("/tickets", response_model=List[schemas.TicketResponse])#กำหนดรูปแบบ เอามาเป็น list ของ ticketResponse
def get_tickets(status: Optional[schemas.TicketStatus] = None, 
                db: Session= Depends(get_db),
                current_user: dict = Depends(get_current_user)):# ตรวจด้วย ticketStatus หรือไม่มีก็ได้
    query = db.query(models.Ticket) #ดึงจาก table Ticket

    if current_user['role'] != "admin":
        query = query.filter(models.Ticket.owner_id == current_user['id'])

    if status: #ถ้าให้ filter statusมา
        query = query.filter(models.Ticket.status == status.value)# .value เพื่อแปลงstatusที่ส่งมาจาก objectเป็นstring

    query = query.order_by(models.Ticket.updated_at.desc())

    tickets = query.all() #ดึงข้อมูลออกมา
    return tickets

#user update ticket ตอน pending เท่านั้น
@router.put("/tickets/{ticket_id}", response_model=schemas.TicketResponse)
def update_tickets(ticket_id: UUID, ticket_update: schemas.TicketUpdate, 
                   db: Session = Depends(get_db),
                   current_user: dict = Depends(get_current_user)):
    db_ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not db_ticket:
        raise HTTPException(status_code=404, detail="ไม่พบ Ticket ที่ระบุ")
    
    # ตรวจสอบสิทธิ์: ต้องเป็นเจ้าของ Ticket หรือ Admin เท่านั้น
    if current_user['role'] != "admin" and str(db_ticket.owner_id) != str(current_user['id']):
        raise HTTPException(status_code=403, detail="คุณไม่มีสิทธิ์ในการแก้ไข Ticket นี้")

    if db_ticket.status != schemas.TicketStatus.pending:
        raise HTTPException(status_code=400, detail="สามารถแก้ไข Ticket ได้เมื่ออยู่ในสถานะ pending เท่านั้น")

    update_data = ticket_update.model_dump(exclude_unset=True)
    #มันจะไปหาตัวแปรใน db_ticket ที่ชื่อตรงกับ key แล้วเปลี่ยนค่าให้เป็น value
    for key, value in update_data.items():
        if isinstance(value, enum.Enum):
            value = value.value #.value แปลงเป็น string
        setattr(db_ticket,key,value)

    db.commit()
    db.refresh(db_ticket)

    return db_ticket

#admin accept ticket
@router.patch("/tickets/{ticket_id}/status", response_model=schemas.TicketResponse)
def update_status(ticket_id: UUID, new_status: schemas.TicketStatus,
                  db: Session=Depends(get_db),
                  current_user: dict = Depends(require_admin)):
    db_ticket = db.query(models.Ticket).filter(models.Ticket.id==ticket_id).first()
    if not db_ticket:
        raise HTTPException(status_code=404, detail="ไม่พบ Ticket ที่ระบุ")
    current_status_val = db_ticket.status.value if hasattr(db_ticket.status, 'value') else db_ticket.status
    #จะเปลี่ยนเป็นสถานะเดิมไม่ได้
    if new_status.value == current_status_val:
        raise HTTPException(status_code=400, detail=f"Ticket นี้อยู่ในสถานะ {current_status_val} อยู่แล้ว")
    #จบไปแล้วจะเปลี่ยนไม่ได้
    if current_status_val in [models.TicketStatus.resolved, models.TicketStatus.rejected]:
        raise HTTPException(status_code=400, detail="ไม่สามารถอัปเดต Ticket ที่ปิดการทำงานแล้วได้")
    #จะ acceptได้ ค่าใน db ต้อง pending ก่อนเสมอ
    if new_status.value == models.TicketStatus.accepted:
        if current_status_val != models.TicketStatus.pending:
            raise HTTPException(status_code=400, detail=f"Ticket ต้องอยู่ในสถานะ pending ก่อนจะกดรับเรื่อง (สถานะปัจจุบัน: {current_status_val})")
    #จะ จบticketได้ข้างในต้องเป็น accepted เสมอ
    elif new_status.value in [models.TicketStatus.rejected, models.TicketStatus.resolved]:
        if current_status_val != models.TicketStatus.accepted:
            raise HTTPException(status_code=400, detail="Ticket ต้องอยู่ในสถานะ accepted (รับเรื่องแล้ว) ก่อนจึงจะปิดงานได้")
            
    #ห้ามเปลี่ยน status กลับเป็น pending
    elif new_status.value == models.TicketStatus.pending:
         raise HTTPException(status_code=400, detail="ไม่สามารถเปลี่ยนสถานะของ Ticket กลับไปเป็น pending ได้")
    
    db_ticket.status = new_status.value
    db.commit()
    db.refresh(db_ticket)

    return db_ticket    

from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from app import models, schemas
from app.database import get_db
from app.api.auth import get_current_user
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
                   db:Session=Depends(get_db)):
    db_ticket = db.query(models.Ticket).filter(models.Ticket.id==ticket_id).first()
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket Not Found!")
    update_data = ticket_update.model_dump(exclude_unset=True)
    if db_ticket.status != schemas.TicketStatus.pending:
        raise HTTPException(status_code=400, detail="Ticket not in pending!")
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
                  current_user: dict = Depends(get_current_user)):
    db_ticket = db.query(models.Ticket).filter(models.Ticket.id==ticket_id).first()
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket Not Found!")
    current_status_val = db_ticket.status.value if hasattr(db_ticket.status, 'value') else db_ticket.status
    # print(new_status)
    #จะเปลี่ยนเป็นสถานะเดิมไม่ได้
    if new_status.value == current_status_val:
        raise HTTPException(status_code=400, detail=f"Ticket is already {current_status_val}")
    #จบไปแล้วจะเปลี่ยนไม่ได้
    if current_status_val in [models.TicketStatus.resolved, models.TicketStatus.rejected]:
        raise HTTPException(status_code=400, detail="Cannot update a closed ticket!")
    #จะ acceptได้ ค่าใน db ต้อง pending ก่อนเสมอ
    if new_status.value == models.TicketStatus.accepted:
        if current_status_val != models.TicketStatus.pending:
            raise HTTPException(status_code=400, detail=f"Must be pending before accepting (Current: {current_status_val})")
    #จะ จบticketได้ข้างในต้องเป็น accepted เสมอ
    elif new_status.value in [models.TicketStatus.rejected, models.TicketStatus.resolved]:
        if current_status_val != models.TicketStatus.accepted:
            raise HTTPException(status_code=400, detail="Must be accepted before closing")
            
    #ห้ามเปลี่ยน status กลับเป็น pending
    elif new_status.value == models.TicketStatus.pending:
         raise HTTPException(status_code=400, detail="Cannot move ticket back to pending")
    
    db_ticket.status = new_status.value
    db.commit()
    db.refresh(db_ticket)

    return db_ticket    

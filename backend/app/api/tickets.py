from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from .. import models, schemas
from .. database import get_db
from typing import List, Optional

router = APIRouter()

@router.post("/tickets",response_model=schemas.TicketResponse) #ตรวจสอบตอนส่งกลับ
def create_ticket(ticket: schemas.TicketCreate,
                  db: Session= Depends(get_db)):#ตรวจสอบตอนรับเข้ามา
    # แปลงใส่ model db
    db_ticket = models.Ticket(
        title=ticket.title,
        description=ticket.description,
        contact_info=ticket.contact_info
        # status, timestamp ใส่ auto
    )
    # บันทึก
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket) #ดึงข้อมูลที่เพิ่งสร้าง

    return db_ticket

@router.get("/tickets", response_model=List[schemas.TicketResponse])#กำหนดรูปแบบ เอามาเป็น list ของ ticketResponse
def get_tickets(status: Optional[schemas.TicketStatus] = None, db: Session= Depends(get_db)):# ตรวจด้วย ticketStatus หรือไม่มีก็ได้
    query = db.query(models.Ticket) #ดึงจาก table Ticket

    if status: #ถ้าให้ filter statusมา
        query = query.filter(models.Ticket.status == status.value)# .value เพื่อแปลงstatusที่ส่งมาจาก objectเป็นstring

    query = query.order_by(models.Ticket.updated_at.desc())

    tickets = query.all() #ดึงข้อมูลออกมา
    return tickets
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from app.api.auth import require_admin
from typing import List, Optional
from app.models import Ticket, User
from app.schemas import RoleUpdate, UserOut
import os
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin/tickets", tags=["Tickets Summary"])

load_dotenv()

llm = OpenAI(
    api_key=os.getenv("TYPHOON_API_KEY"),
    base_url=os.getenv("TYPHOON_BASE_URL")
)

@router.get("/summary", response_model=None)
def get_all_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    now = datetime.now()
    seven_days_ago = now - timedelta(days=7)
    weekly_tickets = db.query(Ticket).filter(Ticket.created_at >= seven_days_ago).all()
    if not weekly_tickets:
        raise HTTPException(status_code=404, detail="No tickets found in the last 7 days.")
    
    # print(len(weekly_tickets))
    summary_result = summary_by_llm(weekly_tickets)

    return summary_result

def summary_by_llm(ticket_lists: List[Ticket]):
    seven_days_ago = datetime.now() - timedelta(days=7)
    filtered_tickets = [
        t for t in ticket_lists 
        if t.created_at >= seven_days_ago
    ]
    context = ""
    for ticket in filtered_tickets:
        context += f"วัน-เวลา: {ticket.created_at}\nหัวเรื่อง ticket: {ticket.title}\nเนื้อหา ticket: {ticket.description}\nสถานะ ticket: {ticket.status.value}\n------------------------------\n"
    
    print(context)
    resolved_count = len([t for t in filtered_tickets if t.status.value == "resolved"])
    rejected_count = len([t for t in filtered_tickets if t.status.value == "rejected"])
    pending_accepted_count = len([t for t in filtered_tickets if t.status.value in ["pending", "accepted"]])
    total_count = len(filtered_tickets)

    system_prompt = f"""
    คุณเป็นสรุปข้อมูล IT Support เจนสรุปรายงานประจำสัปดาห์จากข้อมูล Ticket ทั้งหมด 7 วันล่าสุด
    จงสรุปและวิเคราะห์โดยแยกหัวข้อดังนี้:
    1. 📈 ผลงานที่สำเร็จ (Resolved)
    2. ⚠️ งานค้างวิกฤต (Pending/Accepted)
    3. 🛑 เคสที่ปฏิเสธ (Rejected)
    4. 💡 สรุปภาพรวม

    รูปแบบการสรุป:
    ----------------------------
    จำนวนเคสทั้งหมด: {total_count} เคส
    - จำนวนเคสที่แก้ไขสำเร็จ (Resolved): {resolved_count} เคส
    - จำนวนเคสค้างอยู่ (Pending/Accepted): {pending_accepted_count} เคส
    - จำนวนเคสที่ถูกปฏิเสธ (Rejected): {rejected_count} เคส
    ----------------------------
    1. ผลงานที่สำเร็จ (Resolved):
       - สรุปปัญหาที่แก้ไขได้: [สรุปแนวโน้ม เช่น ปัญหาเกี่ยวกับระบบเครือข่ายเพิ่มขึ้น]
    2. งานค้างวิกฤต (Pending/Accepted):
       - ประเภทปัญหาที่ค้างอยู่: [สรุปประเภท เช่น ปัญหาเกี่ยวกับซอฟต์แวร์ยังคงค้างอยู่มาก]
    3. เคสที่ปฏิเสธ (Rejected):
       - เหตุผลหลักที่เคสถูกปฏิเสธ: [สรุปเหตุผล เช่น ข้อมูลไม่ครบถ้วนเป็นเหตุผลหลักที่เคสถูกปฏิเสธ]
    4. สรุปภาพรวม
    """

    human_prompt = f"""
    นี่คือข้อมูลของตั๋วที่ถูกสร้างขึ้นในช่วง 7 วันที่ผ่านมา:
    
    {context}

    สรุปและวิเคราะห์ตามหัวข้อที่กำหนดใน system prompt โดยใช้ข้อมูลจากตั๋วเหล่านี้
    """

    response = llm.chat.completions.create(
        model="typhoon-v2.5-30b-a3b-instruct",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": human_prompt}
        ],
        max_tokens=16384  
    ).choices[0].message.content
    print("LLM Response:", response)
    return {"summary": response}
    # return total_count
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


router = APIRouter(prefix="/admin/tickets", tags=["Tickets Summary"])

load_dotenv()

llm = OpenAI(
    api_key=os.getenv("TYPHOON_API_KEY"),
    base_url=os.getenv("TYPHOON_BASE_URL")
)

@router.get("/summary", response_model=None)
def get_all_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    ticket_lists = db.query(Ticket).all()
    summary_result = summary_by_llm(ticket_lists)
    return summary_result

def summary_by_llm(ticket_lists: List[Ticket]):
    context = ""
    for ticket in ticket_lists:
        context += f"หัวเรื่อง ticket: {ticket.title}\nเนื้อหา ticket: {ticket.description}\n------------------------------\n"
    
    # print(context)

    period = 7

    system_prompt = """
    คุณเป็นนักสรุปข้อมูลเกี่ยวกับตั๋วปัญหาที่ผู้ใช้ส่งเข้ามาในระบบ Helpdesk ของเรา
    หน้าที่ของคุณคือสรุปภาพรวมและวิเคราะห์ข้อมูล Ticket ของสัปดาห์หรือเดือนที่ได้รับ
    จงสรุปข้อเท็จจริง แนวโน้มปัญหาที่พบบ่อย (Top Issues) และคำแนะนำในรูปแบบข้อๆ เป็นภาษาไทย 
    ห้ามมโนข้อมูลนอกเหนือจากที่ให้ไปเด็ดขาด
    """

    human_prompt = f"""
    นี่คือข้อมูลสรุปของตั๋วประจำช่วงเวลา {period} วัน ที่ผ่านมา:
    
    {context}
    
    จงช่วยสรุปภาพรวมข้อมูลทั้งหมดข้างต้นนี้ให้ฉันหน่อย
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

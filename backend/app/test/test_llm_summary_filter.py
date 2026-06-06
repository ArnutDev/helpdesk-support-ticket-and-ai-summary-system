# # app/test/test_llm_summary_filter.py

# from datetime import datetime, timedelta
# import pytest
# from app.models import Ticket, TicketStatus
# from app.api.summary import summary_by_llm

# def test_summary_should_only_include_tickets_within_7_days_unit():
#     """
#     🎯 Unit Test: ทดสอบโลจิกการคัดกรองวันที่ภายในฟังก์ชัน 
#     โดยส่งก้อน List[Ticket] เข้าไปตรงๆ ไม่ต้องง้อฐานข้อมูล
#     """
#     now = datetime.now()
    
#     # 1. Arrange: สร้าง Object ตั๋วจำลองขึ้นมาลอยๆ ในแรม (ไม่ต้องใส่ id/owner_id ก็ได้เพราะดีบีไม่ได้ตรวจ)
#     ticket_today = Ticket(
#         title="แอร์ห้อง 401 พัง",
#         description="ร้อนมากทำงานไม่ได้",
#         status=TicketStatus.pending,
#         created_at=now
#     )
    
#     ticket_5_days_ago = Ticket(
#         title="Wi-Fi หลุดบ่อย",
#         description="แถวโถงรวมหลุดทุก 5 นาที",
#         status=TicketStatus.accepted,
#         created_at=now - timedelta(days=5)
#     )
    
#     ticket_10_days_ago = Ticket(
#         title="ขอยืมเงินเติมเกม",
#         description="อยากได้สกินใหม่",
#         status=TicketStatus.rejected,
#         created_at=now - timedelta(days=10)
#     )
    
#     # มัดรวมเป็น List ตั๋วดิบทั้งหมดในระบบ
#     all_tickets_input = [ticket_today, ticket_5_days_ago, ticket_10_days_ago]

#     # 2. Act: ส่ง List ข้อมูลดิบเข้าฟังก์ชันคุณนัดตรง ๆ (ไม่ต้องมี db=db_session แล้ว)
#     tickets_for_ai = summary_by_llm(all_tickets_input)

#     # 3. Assert: ตรวจคำตอบว่าฟังก์ชันคัดกรองเหลือ 2 ใบตามโลจิกสัปดาห์ล่าสุดไหม
#     assert tickets_for_ai == 2
    
#     # retrieved_titles = [ticket.title for ticket in tickets_for_ai]
#     # assert "แอร์ห้อง 401 พัง" in retrieved_titles
#     # assert "Wi-Fi หลุดบ่อย" in retrieved_titles
#     # assert "ขอยืมเงินเติมเกม" not in retrieved_titles  # ตัวเก่าเกิน 7 วันต้องโดนกรองทิ้งออกไป
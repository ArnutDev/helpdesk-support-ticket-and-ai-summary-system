import { useState, useEffect } from "react";
import api from "../services/api"; // Import ตัวที่เราตั้งค่าไว้
import TicketCard from "../components/TicketCard";
import TicketForm from "../components/TicketForm";

export default function Home() {
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fetchTickets = async () => {
    try {
      const response = await api.get("/tickets");
      setTickets(response.data);
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };
  useEffect(() => {
    fetchTickets();
  }, []);
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-gray-900">MY TICKETS</h1>
        <button
          onClick={() => setIsModalOpen(true)} // กดแล้วเปิด Modal
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800"
        >
          + แจ้งเรื่องใหม่
        </button>
      </div>

      <div className="space-y-4">
        {tickets.map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </div>

      {/* ถ้า isModalOpen เป็น true ให้แสดง TicketForm */}
      {isModalOpen && (
        <TicketForm
          onClose={() => setIsModalOpen(false)}
          onRefresh={fetchTickets}
        />
      )}
    </div>
  );
}

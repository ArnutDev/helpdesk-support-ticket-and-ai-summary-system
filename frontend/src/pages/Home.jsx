import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import TicketCard from "../components/TicketCard";
import TicketForm from "../components/TicketForm";

export default function Home() {
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      const response = await api.get("/tickets");
      setTickets(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    navigate("/login");
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-white uppercase">My Tickets</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200"
          >
            + แจ้งเรื่องใหม่
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
          >
            LOGOUT
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {tickets.length > 0 ? (
          tickets.map((t) => <TicketCard key={t.id} ticket={t} />)
        ) : (
          <div className="text-center py-10 text-gray-400">
            ยังไม่มีประวัติการแจ้งซ่อมของคุณ
          </div>
        )}
      </div>

      {isModalOpen && (
        <TicketForm
          onClose={() => setIsModalOpen(false)}
          onRefresh={fetchTickets}
        />
      )}
    </div>
  );
}

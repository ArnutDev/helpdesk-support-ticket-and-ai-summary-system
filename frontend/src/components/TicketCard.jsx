import React from "react";

export default function TicketCard({ ticket }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-500",
    accepted: "bg-blue-100 text-blue-800 border-blue-500",
    resolved: "bg-green-100 text-green-800 border-green-500",
    rejected: "bg-red-100 text-red-800 border-red-500",
  };
  return (
    <div
      className={`g-white p-5 rounded-xl shadow-sm border-l-4 ${statusColors[ticket.status]} mb-4`}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-gray-800">{ticket.title}</h3>
        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase`}>
          {ticket.status}
        </span>
      </div>
      <p className="text-gray-600 mt-2 text-sm">{ticket.description}</p>
      <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
        <span>ติดต่อ: {ticket.contact_info}</span>
        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

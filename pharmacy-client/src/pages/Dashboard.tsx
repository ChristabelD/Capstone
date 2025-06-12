import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth"); // or your auth key
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-green-700">
          Welcome to the Pharmacy Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-4 rounded shadow hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/orders")}>
            <h2 className="text-xl font-semibold text-green-800">📦 Order History</h2>
            <p className="text-sm text-gray-600">View all your past orders and invoices.</p>
          </div>

          <div className="bg-green-50 p-4 rounded shadow hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/orders/12345")}>
            <h2 className="text-xl font-semibold text-green-800">🚚 Track Order</h2>
            <p className="text-sm text-gray-600">Check the current status of an order.</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-6 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

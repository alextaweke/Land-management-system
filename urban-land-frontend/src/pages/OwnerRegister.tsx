import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const OwnerRegister: React.FC = () => {
  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    password: "",
    role: "owner", // fixed role for owners
  });

  const navigate = useNavigate();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.post("/register/", form); // same API, backend should handle role
      alert("Owner registered successfully");
      navigate("/owners"); // redirect to owners list after registration
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Error registering owner");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-lg font-bold mb-4">Register Owner</h2>

        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Full Name"
          className="w-full border p-2 mb-2"
        />

        <input
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          className="w-full border p-2 mb-2"
        />

        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Phone"
          className="w-full border p-2 mb-2"
        />

        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Address"
          className="w-full border p-2 mb-2"
        />

        <input
          required
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
          className="w-full border p-2 mb-2"
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Register Owner
        </button>
      </form>
    </div>
  );
};

export default OwnerRegister;

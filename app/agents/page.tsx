"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type Agent = {
  id?: string;
  employee_no: string;
  full_name: string;
  shift_start: string | null;
  shift_end: string | null;
  home_area: string | null;
  status: string | null;
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [employeeNo, setEmployeeNo] = useState("");
  const [name, setName] = useState("");
  const [homeArea, setHomeArea] = useState("");
  const [workArea, setWorkArea] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");

  async function loadAgents() {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setAgents(data || []);
  }

  async function saveAgent() {
    if (!employeeNo || !name) {
      alert("Please enter Employee Number and Full Name");
      return;
    }

    const { error } = await supabase.from("agents").insert({
      platform_id: PLATFORM_ID,
      employee_no: employeeNo,
      full_name: name,
      work_email: workEmail,
      phone,
      home_area: homeArea,
      work_area: workArea,
      shift_start: shiftStart,
      shift_end: shiftEnd,
      status: "Active",
    });

    if (error) {
      alert(error.message);
      return;
    }

    setEmployeeNo("");
    setName("");
    setHomeArea("");
    setWorkArea("");
    setWorkEmail("");
    setPhone("");
    setShiftStart("");
    setShiftEnd("");

    loadAgents();
  }

  useEffect(() => {
    loadAgents();
  }, []);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">Agents</h1>

      <p className="text-gray-600 mt-2">
        Add and manage employee transport information.
      </p>

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Add Agent</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input value={employeeNo} onChange={(e) => setEmployeeNo(e.target.value)} className="border p-3 rounded-lg" placeholder="Employee Number" />
          <input value={name} onChange={(e) => setName(e.target.value)} className="border p-3 rounded-lg" placeholder="Full Name" />
          <input value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} className="border p-3 rounded-lg" placeholder="Work Email" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="border p-3 rounded-lg" placeholder="Phone Number" />
          <input value={homeArea} onChange={(e) => setHomeArea(e.target.value)} className="border p-3 rounded-lg" placeholder="Home Area" />
          <input value={workArea} onChange={(e) => setWorkArea(e.target.value)} className="border p-3 rounded-lg" placeholder="Work Area" />
          <input value={shiftStart} onChange={(e) => setShiftStart(e.target.value)} className="border p-3 rounded-lg" placeholder="Shift Start Time" />
          <input value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)} className="border p-3 rounded-lg" placeholder="Shift End Time" />
        </div>

        <button onClick={saveAgent} className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-bold">
          Save Agent
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Agent List</h2>

        <div className="grid grid-cols-5 font-bold border-b pb-2">
          <p>Employee No.</p>
          <p>Name</p>
          <p>Shift</p>
          <p>Home Area</p>
          <p>Status</p>
        </div>

        {agents.map((agent) => (
          <div key={agent.id} className="grid grid-cols-5 py-3 border-b">
            <p>{agent.employee_no}</p>
            <p>{agent.full_name}</p>
            <p>{agent.shift_start} - {agent.shift_end}</p>
            <p>{agent.home_area}</p>
            <p>{agent.status}</p>
          </div>
        ))}
      </div>
      </main>
    </AdminLayout>
  );
}

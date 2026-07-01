"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";

type Agent = {
  id?: string;
  employee_number: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  pickup_area: string | null;
  work_location: string | null;
  pickup_address: string | null;
  destination_address: string | null;
  shift: string | null;
  active: boolean | null;
  employee_status: string | null;
};

export default function AgentsPage() {
  const [platformId, setPlatformId] = useState<string | null>(null);

  const [agents, setAgents] = useState<Agent[]>([]);

  const [employeeNo, setEmployeeNo] = useState("");
  const [name, setName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [homeArea, setHomeArea] = useState("");
  const [workArea, setWorkArea] = useState("");

  const [homeAddress, setHomeAddress] = useState("");
  const [workAddress, setWorkAddress] = useState("");

  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");

  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
const [validationErrors, setValidationErrors] = useState<string[]>([]);
const [validRows, setValidRows] = useState<string[][]>([]);
  useEffect(() => {
    async function setupPage() {
      const userPlatform = await getUserPlatform();

      if (!userPlatform) {
        window.location.href = "/login";
        return;
      }

      setPlatformId(userPlatform.platformId);
    }

    setupPage();
  }, []);

  useEffect(() => {
    if (!platformId) return;
    loadAgents();
  }, [platformId]);

  async function loadAgents() {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("platform_id", platformId)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setAgents(data || []);
  }

async function previewCsv(file: File) {
  const text = await file.text();

  const rows = text
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row.length > 0)
    .map((row) => row.split(","));

  setPreviewRows(rows);

  const errors: string[] = [];
  const valid: string[][] = [];

  rows.forEach((row, index) => {
    // Keep the header row
    if (index === 0) {
      valid.push(row);
      return;
    }

    const employeeNumber = row[0]?.trim();
    const fullName = row[1]?.trim();
    const email = row[2]?.trim();

    if (!employeeNumber) {
      errors.push(`Row ${index + 1}: Missing Employee Number`);
      return;
    }

    if (!fullName) {
      errors.push(`Row ${index + 1}: Missing Full Name`);
      return;
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      errors.push(`Row ${index + 1}: Invalid Email`);
      return;
    }

    valid.push(row);
  });

  setValidationErrors(errors);
  setValidRows(valid);
}
async function importValidatedRows() {
  if (!platformId) return;

  if (validRows.length <= 1) {
    alert("No valid rows to import.");
    return;
  }

  const rows = validRows.slice(1).map((row) => ({
    platform_id: platformId,
    employee_number: row[0] || "",
    full_name: row[1] || "",
    email: row[2] || "",
    phone: row[3] || "",
    pickup_area: row[4] || "",
    work_location: row[5] || "",
    pickup_address: row[6] || "",
    destination_address: row[7] || "",
    shift: row[8] || "",
    active: true,
    employee_status: "Active",
  }));

  const { error } = await supabase
    .from("agents")
    .insert(rows);

  if (error) {
    alert(error.message);
    return;
  }

  alert(`${rows.length} employees imported successfully.`);

  setShowImportModal(false);
  setSelectedFile(null);
  setPreviewRows([]);
  setValidationErrors([]);
  setValidRows([]);

  loadAgents();
}
  async function saveAgent() {
    if (!platformId) return;

    if (!employeeNo || !name) {
      alert("Employee Number and Full Name are required.");
      return;
    }

    const { error } = await supabase.from("agents").insert({
      platform_id: platformId,
      employee_number: employeeNo,
      full_name: name,
      email: workEmail,
      phone,
      pickup_area: homeArea,
      work_location: workArea,
      pickup_address: homeAddress,
      destination_address: workAddress,
      shift: `${shiftStart} - ${shiftEnd}`,
      active: true,
      employee_status: "Active",
    });

    if (error) {
      alert(error.message);
      return;
    }

    try {
      await fetch("/api/create-agent-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: workEmail,
          password: "Temp1234!",
          full_name: name,
          platform_id: platformId,
        }),
      });
    } catch (err) {
      console.error(err);
    }

    setEmployeeNo("");
    setName("");
    setWorkEmail("");
    setPhone("");
    setHomeArea("");
    setWorkArea("");
    setHomeAddress("");
    setWorkAddress("");
    setShiftStart("");
    setShiftEnd("");

    loadAgents();
  }

  return (

    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">

        <h1 className="text-4xl font-bold text-[#061B33]">
          Agents
        </h1>

        <p className="text-gray-600 mt-2">
          Add and manage employee transport information.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-[#061B33] text-white px-6 py-3 rounded-xl font-bold"
          >
            📥 Import Employees
          </button>
        </div>

        {/* Add Agent */}

        <div className="bg-white rounded-xl shadow p-6 mt-6">

          <h2 className="text-xl font-bold mb-4">
            Add Agent
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              value={employeeNo}
              onChange={(e) => setEmployeeNo(e.target.value)}
              className="border p-3 rounded-lg"
              placeholder="Employee Number"
            />

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-3 rounded-lg"
              placeholder="Full Name"
            />

            <input
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
              className="border p-3 rounded-lg"
              placeholder="Work Email"
            />

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border p-3 rounded-lg"
              placeholder="Phone Number"
            />

            <input
              value={homeArea}
              onChange={(e) => setHomeArea(e.target.value)}
              className="border p-3 rounded-lg"
              placeholder="Pickup Area"
            />

            <input
              value={workArea}
              onChange={(e) => setWorkArea(e.target.value)}
              className="border p-3 rounded-lg"
              placeholder="Work Location"
            />

            <textarea
              value={homeAddress}
              onChange={(e) => setHomeAddress(e.target.value)}
              className="border p-3 rounded-lg"
              placeholder="Pickup Address"
            />

            <textarea
              value={workAddress}
              onChange={(e) => setWorkAddress(e.target.value)}
              className="border p-3 rounded-lg"
              placeholder="Destination Address"
            />

            <input
              value={shiftStart}
              onChange={(e) => setShiftStart(e.target.value)}
              className="border p-3 rounded-lg"
              placeholder="Shift Start"
            />

            <input
              value={shiftEnd}
              onChange={(e) => setShiftEnd(e.target.value)}
              className="border p-3 rounded-lg"
              placeholder="Shift End"
            />

          </div>

          <button
            onClick={saveAgent}
            className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-bold"
          >
            Save Agent
          </button>

        </div>

        {/* Agent List */}

        <div className="bg-white rounded-xl shadow p-6 mt-6">

          <h2 className="text-xl font-bold mb-4">
            Agent List
          </h2>

          <div className="grid grid-cols-5 font-bold border-b pb-2">
            <p>Employee No.</p>
            <p>Name</p>
            <p>Shift</p>
            <p>Pickup Area</p>
            <p>Status</p>
          </div>

          {agents.map((agent) => (
            <div
              key={agent.id}
              className="grid grid-cols-5 py-3 border-b"
            >
              <p>{agent.employee_number}</p>
              <p>{agent.full_name}</p>
              <p>{agent.shift}</p>
              <p>{agent.pickup_area}</p>
              <p>{agent.employee_status}</p>
            </div>
          ))}

        </div>
                {/* Import Modal */}

        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

              <h2 className="text-2xl font-bold text-[#061B33]">
                Import Employees
              </h2>

              <p className="mt-2 text-gray-500">
                Select a CSV file to import employees.
              </p>

              <input
                type="file"
                accept=".csv"
                className="mt-6 w-full rounded-lg border p-3"
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null;

                  setSelectedFile(file);

                  if (file) {
                    await previewCsv(file);
                  }
                }}
              />

              {selectedFile && (
                <div className="mt-4 rounded-lg bg-blue-50 p-3">
                  <p className="font-bold">Selected File</p>
                  <p>{selectedFile.name}</p>
                </div>
              )}

{previewRows.length > 0 && (
  <div className="mt-6">
    <h3 className="mb-2 font-bold">
      CSV Preview
    </h3>

    <div className="max-h-56 overflow-auto rounded-lg border">
      <table className="w-full text-sm">
        <tbody>
          {previewRows.slice(0, 5).map((row, index) => (
            <tr key={index} className="border-b">
              {row.map((cell, i) => (
                <td key={i} className="px-2 py-1">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {previewRows.length > 5 && (
      <p className="mt-2 text-xs text-gray-500">
        Showing first 5 rows...
      </p>
    )}
  </div>
)}

{validationErrors.length > 0 && (
  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
    <h3 className="font-bold text-red-700">
      Validation Errors
    </h3>

    <ul className="mt-3 list-disc pl-5 text-sm text-red-600">
      {validationErrors.map((error, index) => (
        <li key={index}>{error}</li>
      ))}
    </ul>
  </div>
)}

{validationErrors.length === 0 && previewRows.length > 0 && (
  <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
    <h3 className="font-bold text-green-700">
      ✅ Validation Passed
    </h3>

    <p className="mt-2 text-sm text-green-700">
      {validRows.length - 1} employee records are ready to import.
    </p>
  </div>
)}

{validationErrors.length === 0 && previewRows.length > 0 && (
  <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
    <h3 className="font-bold text-green-700">
      ✅ Validation Passed
    </h3>

    <p className="mt-2 text-sm text-green-700">
      {validRows.length - 1} employee records are ready to import.
    </p>
  </div>
)}
                <div className="mt-6">
                  <h3 className="mb-2 font-bold">
                    CSV Preview
                  </h3>

                  <div className="max-h-56 overflow-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <tbody>
                        {previewRows.slice(0, 5).map((row, index) => (
                          <tr
                            key={index}
                            className="border-b"
                          >
                            {row.map((cell, i) => (
                              <td
                                key={i}
                                className="px-2 py-1"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {previewRows.length > 5 && (
                    <p className="mt-2 text-xs text-gray-500">
                      Showing first 5 rows...
                    </p>
                  )}
                </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setSelectedFile(null);
                    setPreviewRows([]);
                  }}
                  className="rounded-lg border px-5 py-2"
                >
                  Cancel
                </button>

<button
  onClick={importValidatedRows}
  disabled={!selectedFile || validationErrors.length > 0}
  className="rounded-lg bg-orange-500 px-5 py-2 text-white disabled:opacity-50"
>
  Import Employees
</button>
              </div>

            </div>
          </div>
        )}

      </main>
    </AdminLayout>
  );
}
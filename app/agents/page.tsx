"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import Pagination from "../../components/common/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";

function AddressAutocomplete({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const places = useMapsLibrary("places");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!places || !containerRef.current) return;

    const autocompleteElement = new places.PlaceAutocompleteElement({
      includedRegionCodes: ["za"],
    });

    autocompleteElement.placeholder = placeholder;

    autocompleteElement.addEventListener("gmp-select", async (event) => {
      const placePrediction = event.placePrediction;

      if (!placePrediction) return;

      const place = placePrediction.toPlace();

      await place.fetchFields({
        fields: ["formattedAddress", "location"],
      });

      if (place.formattedAddress) {
        onChangeRef.current(place.formattedAddress);
      }
    });

    containerRef.current.replaceChildren(autocompleteElement);

    return () => {
      if (containerRef.current) {
        containerRef.current.replaceChildren();
      }
    };
  }, [places, placeholder]);

  return (
    <div ref={containerRef} className="w-full min-h-[46px]" />
  );
}

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
  const googleMapsApiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [totalAgents, setTotalAgents] = useState(0);
  const [platformId, setPlatformId] = useState<string | null>(null);

  const {
    page,
    pageSize,
    from,
    to,
    setPage,
  } = usePagination(totalAgents, 25);

  const [agents, setAgents] = useState<Agent[]>([]);
const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
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
    setPage(1);
  }, [platformId, setPage]);

  const loadAgents = useCallback(async () => {
    if (!platformId) return;

    const { data, error, count } = await supabase
      .from("agents")
      .select("*", { count: "exact" })
      .eq("platform_id", platformId)
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setAgents(data || []);
    setTotalAgents(count ?? 0);
  }, [from, platformId, to]);

  useEffect(() => {
    if (!platformId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAgents();
  }, [platformId, page, loadAgents]);

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

    // One admin-facing pickup location
    pickup_area: homeArea,
    pickup_address: homeArea,

    // One admin-facing destination
    work_location: workArea,
    destination_address: workArea,

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
async function deleteAgent(agent: Agent) {
  if (!agent.id) {
    alert("Agent ID not found.");
    return;
  }

  const confirmed = confirm(
    `Delete ${agent.full_name}? This cannot be undone.`
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("agents")
    .delete()
    .eq("id", agent.id)
    .eq("platform_id", platformId);

  if (error) {
    alert(error.message);
    return;
  }

  await loadAgents();

  alert("Agent deleted successfully.");
}
async function updateAgent() {
  if (!platformId || !editingAgent?.id) {
    alert("Agent information is incomplete.");
    return;
  }

  const { error } = await supabase
    .from("agents")
    .update({
      employee_number: editingAgent.employee_number,
      full_name: editingAgent.full_name,
      email: editingAgent.email,
      phone: editingAgent.phone,

      pickup_area: editingAgent.pickup_address,
      pickup_address: editingAgent.pickup_address,

      work_location: editingAgent.destination_address,
      destination_address: editingAgent.destination_address,

      shift: editingAgent.shift,
      employee_status: editingAgent.employee_status,
      active: editingAgent.active,
    })
    .eq("id", editingAgent.id)
    .eq("platform_id", platformId);

  if (error) {
    alert(error.message);
    return;
  }

  setEditingAgent(null);
  await loadAgents();

  alert("Agent updated successfully.");
}
return (

  <APIProvider apiKey={googleMapsApiKey}>
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

<AddressAutocomplete
  value={homeArea}
  onChange={setHomeArea}
  placeholder="Pickup Location"
/>

<AddressAutocomplete
  value={workArea}
  onChange={setWorkArea}
  placeholder="Destination / Work Location"
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

  <h2 className="text-xl font-bold mb-6">
    Agent List
  </h2>

  <div className="space-y-4">

    {agents.map((agent) => (
      <div
        key={agent.id}
        className="border rounded-2xl p-5 bg-slate-50"
      >

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">
              Employee
            </p>

            <p className="font-bold text-[#061B33]">
              {agent.full_name}
            </p>

            <p className="text-sm text-gray-600">
              {agent.employee_number}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">
              Contact
            </p>

            <p className="text-sm">
              📞 {agent.phone || "No phone"}
            </p>

            <p className="text-sm break-all">
              ✉️ {agent.email || "No email"}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">
              📍 Pickup
            </p>

            <p className="font-semibold text-[#061B33]">
              {agent.pickup_address || agent.pickup_area || "No pickup location"}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">
              🏢 Destination
            </p>

            <p className="font-semibold text-[#061B33]">
              {agent.destination_address || agent.work_location || "No destination"}
            </p>
          </div>

        </div>

        <div className="mt-5 pt-4 border-t flex flex-wrap gap-3 items-center">

          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
            🕐 {agent.shift || "No shift"}
          </span>

          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              agent.employee_status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {agent.employee_status || "Unknown"}
          </span>

        </div>
        <div className="mt-4 flex flex-wrap gap-3 justify-end">

          <button
            onClick={() => setEditingAgent(agent)}
            className="bg-[#061B33] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#0b2b52]"
          >
            ✏️ Edit Agent
          </button>

          <button
            onClick={() => deleteAgent(agent)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700"
          >
            🗑️ Delete Agent
          </button>

        </div>
      </div>
    ))}

    {agents.length === 0 && (
      <p className="text-gray-500">
        No agents available yet.
      </p>
    )}

  </div>

  <Pagination
    page={page}
    pageSize={pageSize}
    total={totalAgents}
    onPageChange={setPage}
  />

</div>
        {editingAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#061B33]">
                  Edit Agent
                </h2>

                <button
                  onClick={() => setEditingAgent(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <input
                  value={editingAgent.employee_number}
                  onChange={(e) =>
                    setEditingAgent({
                      ...editingAgent,
                      employee_number: e.target.value,
                    })
                  }
                  className="border p-3 rounded-lg"
                  placeholder="Employee Number"
                />

                <input
                  value={editingAgent.full_name}
                  onChange={(e) =>
                    setEditingAgent({
                      ...editingAgent,
                      full_name: e.target.value,
                    })
                  }
                  className="border p-3 rounded-lg"
                  placeholder="Full Name"
                />

                <input
                  value={editingAgent.email || ""}
                  onChange={(e) =>
                    setEditingAgent({
                      ...editingAgent,
                      email: e.target.value,
                    })
                  }
                  className="border p-3 rounded-lg"
                  placeholder="Work Email"
                />

                <input
                  value={editingAgent.phone || ""}
                  onChange={(e) =>
                    setEditingAgent({
                      ...editingAgent,
                      phone: e.target.value,
                    })
                  }
                  className="border p-3 rounded-lg"
                  placeholder="Phone Number"
                />

                <AddressAutocomplete
                  value={editingAgent.pickup_address || editingAgent.pickup_area || ""}
                  onChange={(value) =>
                    setEditingAgent({
                      ...editingAgent,
                      pickup_address: value,
                      pickup_area: value,
                    })
                  }
                  placeholder="Pickup Location"
                />

                <AddressAutocomplete
                  value={
                    editingAgent.destination_address ||
                    editingAgent.work_location ||
                    ""
                  }
                  onChange={(value) =>
                    setEditingAgent({
                      ...editingAgent,
                      destination_address: value,
                      work_location: value,
                    })
                  }
                  placeholder="Destination / Work Location"
                />

                <input
                  value={editingAgent.shift?.split(" - ")[0] || ""}
                  onChange={(e) => {
                    const end =
                      editingAgent.shift?.split(" - ")[1] || "";

                    setEditingAgent({
                      ...editingAgent,
                      shift: `${e.target.value} - ${end}`,
                    });
                  }}
                  className="border p-3 rounded-lg"
                  placeholder="Shift Start"
                />

                <input
                  value={editingAgent.shift?.split(" - ")[1] || ""}
                  onChange={(e) => {
                    const start =
                      editingAgent.shift?.split(" - ")[0] || "";

                    setEditingAgent({
                      ...editingAgent,
                      shift: `${start} - ${e.target.value}`,
                    });
                  }}
                  className="border p-3 rounded-lg"
                  placeholder="Shift End"
                />

              </div>

              <div className="mt-6 flex gap-3 justify-end">

                <button
                  onClick={() => setEditingAgent(null)}
                  className="bg-gray-500 text-white px-5 py-3 rounded-lg font-bold"
                >
                  Cancel
                </button>

                <button
                  onClick={updateAgent}
                  className="bg-green-600 text-white px-5 py-3 rounded-lg font-bold"
                >
                  💾 Save Changes
                </button>

              </div>

            </div>
          </div>
        )}
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
  </APIProvider>
  );
}

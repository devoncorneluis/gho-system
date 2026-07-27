"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OperationsPage;
var link_1 = require("next/link");
var react_1 = require("react");
var AdminLayout_1 = require("../../components/AdminLayout");
var supabase_1 = require("../../lib/supabase");
function OperationsPage() {
    var _a = (0, react_1.useState)([]), recentEmergencies = _a[0], setRecentEmergencies = _a[1];
    var _b = (0, react_1.useState)(0), activeTrips = _b[0], setActiveTrips = _b[1];
    var _c = (0, react_1.useState)([]), activityFeed = _c[0], setActivityFeed = _c[1];
    var _d = (0, react_1.useState)([]), fleetDrivers = _d[0], setFleetDrivers = _d[1];
    var _e = (0, react_1.useState)(0), driversOnline = _e[0], setDriversOnline = _e[1];
    var _f = (0, react_1.useState)(0), vehiclesAvailable = _f[0], setVehiclesAvailable = _f[1];
    var _g = (0, react_1.useState)(0), openEmergencies = _g[0], setOpenEmergencies = _g[1];
    var _h = (0, react_1.useState)([]), recentTrips = _h[0], setRecentTrips = _h[1];
    function getStatusColor(status) {
        switch (status) {
            case "Assigned":
                return "bg-blue-100 text-blue-700";
            case "Accepted":
                return "bg-indigo-100 text-indigo-700";
            case "En Route":
                return "bg-yellow-100 text-yellow-700";
            case "Arrived":
                return "bg-orange-100 text-orange-700";
            case "In Transit":
                return "bg-purple-100 text-purple-700";
            case "Completed":
                return "bg-green-100 text-green-700";
            case "Cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    }
    function loadDashboard() {
        return __awaiter(this, void 0, void 0, function () {
            var _a, tripsResult, driversResult, vehiclesResult, emergenciesResult, emergencies, drivers, trips;
            var _b, _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            supabase_1.supabase
                                .from("trips")
                                .select("*", { count: "exact", head: true })
                                .neq("status", "Completed"),
                            supabase_1.supabase
                                .from("driver_locations")
                                .select("*", { count: "exact", head: true })
                                .eq("is_tracking", true),
                            supabase_1.supabase
                                .from("vehicles")
                                .select("*", { count: "exact", head: true })
                                .eq("availability_status", "Available"),
                            supabase_1.supabase
                                .from("emergency_alerts")
                                .select("*", { count: "exact", head: true })
                                .eq("status", "Open"),
                        ])];
                    case 1:
                        _a = _j.sent(), tripsResult = _a[0], driversResult = _a[1], vehiclesResult = _a[2], emergenciesResult = _a[3];
                        return [4 /*yield*/, supabase_1.supabase
                                .from("emergency_alerts")
                                .select("id, driver_name, alert_type, status, created_at")
                                .order("created_at", { ascending: false })
                                .limit(5)];
                    case 2:
                        emergencies = (_j.sent()).data;
                        return [4 /*yield*/, supabase_1.supabase
                                .from("drivers")
                                .select("id, full_name, status, vehicle_name, current_trip")
                                .order("full_name")];
                    case 3:
                        drivers = (_j.sent()).data;
                        setFleetDrivers(drivers || []);
                        setRecentEmergencies(emergencies || []);
                        setActivityFeed([
                            {
                                id: "1",
                                title: "".concat((_b = tripsResult.count) !== null && _b !== void 0 ? _b : 0, " active trips"),
                                time: "Live",
                            },
                            {
                                id: "2",
                                title: "".concat((_c = driversResult.count) !== null && _c !== void 0 ? _c : 0, " drivers currently online"),
                                time: "Live",
                            },
                            {
                                id: "3",
                                title: "".concat((_d = emergenciesResult.count) !== null && _d !== void 0 ? _d : 0, " open emergencies"),
                                time: "Live",
                            },
                        ]);
                        return [4 /*yield*/, supabase_1.supabase
                                .from("trips")
                                .select("id, trip_code, driver_name, vehicle_name, status, trip_date")
                                .order("trip_date", { ascending: false })
                                .limit(5)];
                    case 4:
                        trips = (_j.sent()).data;
                        setRecentTrips(trips || []);
                        setActiveTrips((_e = tripsResult.count) !== null && _e !== void 0 ? _e : 0);
                        setDriversOnline((_f = driversResult.count) !== null && _f !== void 0 ? _f : 0);
                        setVehiclesAvailable((_g = vehiclesResult.count) !== null && _g !== void 0 ? _g : 0);
                        setOpenEmergencies((_h = emergenciesResult.count) !== null && _h !== void 0 ? _h : 0);
                        return [2 /*return*/];
                }
            });
        });
    }
    (0, react_1.useEffect)(function () {
        loadDashboard();
        var interval = setInterval(function () {
            loadDashboard();
        }, 15000);
        return function () { return clearInterval(interval); };
    }, []);
    return (<AdminLayout_1.default>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-black text-[#061B33]">
          GHO Operations Command Centre
        </h1>

        <p className="text-gray-500 mt-2">
          Live transport operations across the platform.
        </p>
        <div className="flex flex-wrap gap-4 mt-8">

  <link_1.default href="/trips" className="rounded-xl bg-[#F58220] px-5 py-3 font-bold text-white hover:opacity-90">
    + New Trip
  </link_1.default>

  <link_1.default href="/dispatch-command" className="rounded-xl bg-[#061B33] px-5 py-3 font-bold text-white hover:opacity-90">
    Dispatch
  </link_1.default>

  <link_1.default href="/emergency-dashboard" className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700">
    Emergencies
  </link_1.default>

  <link_1.default href="/live-map" className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700">
    Live Map
  </link_1.default>

    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-8">
  <div className="bg-white rounded-2xl shadow p-6">
    <p className="text-gray-500">Active Trips</p>
    <h2 className="text-4xl font-black mt-2">{activeTrips}</h2>
  </div>

  <div className="bg-white rounded-2xl shadow p-6">
    <p className="text-gray-500">Drivers Online</p>
    <h2 className="text-4xl font-black mt-2">{driversOnline}</h2>
  </div>

  <div className="bg-white rounded-2xl shadow p-6">
    <p className="text-gray-500">Vehicles Available</p>
    <h2 className="text-4xl font-black mt-2">{vehiclesAvailable}</h2>
  </div>

  <div className="bg-white rounded-2xl shadow p-6">
    <p className="text-gray-500">Open Emergencies</p>
    <h2 className="text-4xl font-black text-red-600 mt-2">
      {openEmergencies}
    </h2>
  </div>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
  <section className="bg-white rounded-2xl shadow p-6">
  <h2 className="text-2xl font-bold text-[#061B33] mb-4">
    Live Dispatch Queue
  </h2>

  {recentTrips.length === 0 ? (<p className="text-gray-500">No trips available.</p>) : (<div className="space-y-3">
      {recentTrips.map(function (trip) { return (<div key={trip.id} className="flex items-center justify-between border rounded-xl p-4">
          <div>
            <p className="font-bold">{trip.trip_code || "No Trip Code"}</p>
            <p className="text-sm text-gray-500">
              {trip.driver_name || "No Driver"} • {trip.vehicle_name || "No Vehicle"}
            </p>
          </div>

          <span className={"rounded-full px-3 py-1 text-sm font-semibold ".concat(getStatusColor(trip.status))}>
            {trip.status || "Unknown"}
          </span>
        </div>); })}
    </div>)}
    </section>

    <section className="bg-white rounded-2xl shadow p-6">
  <h2 className="text-2xl font-bold text-[#061B33] mb-4">
    Live Fleet Status
  </h2>

  {fleetDrivers.length === 0 ? (<p className="text-gray-500">No drivers found.</p>) : (<div className="space-y-3">
      {fleetDrivers.map(function (driver) { return (<div key={driver.id} className="flex items-center justify-between border rounded-xl p-4">
          <div>
            <p className="font-bold">{driver.full_name}</p>

            <p className="text-sm text-gray-500">
              Vehicle: {driver.vehicle_name || "Not Assigned"}
            </p>

            <p className="text-sm text-gray-500">
              Trip: {driver.current_trip || "No Active Trip"}
            </p>
          </div>

          <span className={"rounded-full px-3 py-1 text-sm font-semibold ".concat(driver.status === "Available"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700")}>
            {driver.status || "Unknown"}
          </span>
        </div>); })}
    </div>)}
    </section>

    <section className="bg-white rounded-2xl shadow p-6">
  <h2 className="text-2xl font-bold text-[#061B33] mb-4">
    Recent Emergencies
  </h2>

  {recentEmergencies.length === 0 ? (<p className="text-gray-500">No recent emergencies.</p>) : (<div className="space-y-3">
      {recentEmergencies.map(function (emergency) { return (<div key={emergency.id} className="flex items-center justify-between border rounded-xl p-4">
          <div>
            <p className="font-bold">
              {emergency.alert_type || "Emergency"}
            </p>

            <p className="text-sm text-gray-500">
              {emergency.driver_name || "Unknown Driver"}
            </p>
          </div>

          <span className={"rounded-full px-3 py-1 text-sm font-semibold ".concat(emergency.status === "Open"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700")}>
            {emergency.status}
          </span>
        </div>); })}
    </div>)}
    </section>

    <section className="bg-white rounded-2xl shadow p-6">
  <h2 className="text-2xl font-bold text-[#061B33] mb-4">
    Operations Activity
  </h2>

  <div className="space-y-3">
    {activityFeed.map(function (item) { return (<div key={item.id} className="flex items-center justify-between border-b pb-3">
        <span>{item.title}</span>
        <span className="text-sm text-gray-500">{item.time}</span>
      </div>); })}
  </div>
    </section>

    </div>

    </main>
    </AdminLayout_1.default>);
}

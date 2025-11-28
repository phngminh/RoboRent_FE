import React, { useEffect, useState } from "react";
import { MapPin, MoreHorizontal, Plus, X } from "lucide-react";
import { getAllScheduleByGroupIdAsync } from "../../apis/groupSchedule.staff.api";
import { addScheduleAsync } from "../../apis/groupSchedule.staff.api"; // <-- make sure this path is correct
import { getReceivedRentalByStaffIdAsync } from "../../apis/rental.staff.api";
import { useParams } from "react-router-dom";

// -------------------------
// Types
// -------------------------
type ScheduleItem = {
  eventDate: string;
  eventLocation: string;
  eventCity: string;
  deliveryTime: string;
  startTime: string;
  endTime: string;
  finishTime: string;
  status: string;
  isDeleted: boolean;
  activityTypeGroupId: number;
  rentalId: number;
  staffId: number;
  staffFullName: string;
  customerId: number;
  customerFullName: string;
};

type ScheduleGroup = {
  eventDate: string;
  items: ScheduleItem[];
};

// -------------------------
// Status Badge
// -------------------------
const getStatusBadgeClasses = (status: string) => {
  switch (status.toLowerCase()) {
    case "planned":
      return "bg-yellow-200 text-yellow-900 border border-yellow-400";
    case "completed":
      return "bg-green-200 text-green-900 border border-green-400";
    case "cancelled":
    case "canceled":
      return "bg-red-200 text-red-900 border border-red-400";
    default:
      return "bg-gray-200 text-gray-900 border border-gray-400";
  }
};

// -------------------------
// Card Component
// -------------------------
const ScheduleCard = ({ item }: { item: ScheduleItem }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col gap-4 relative">
      {/* LOCATION */}
      <div className="flex items-center gap-2 text-gray-800">
        <MapPin size={18} className="text-indigo-600" />
        <div className="font-semibold">{item.eventLocation}</div>
        <span className="text-sm text-gray-500">({item.eventCity})</span>
      </div>

      {/* TIME */}
      <div className="text-gray-700 text-sm space-y-1 mt-1 text-center">
        <div>
          <strong>Delivery:</strong> {item.deliveryTime}
        </div>
        <div>
          <strong>Start – End:</strong> {item.startTime} – {item.endTime}
        </div>
        <div>
          <strong>Finish:</strong> {item.finishTime}
        </div>
      </div>

      {/* STAFF & CUSTOMER */}
      <div className="mt-3 text-xs text-gray-600">
        <div>
          <strong>Staff:</strong> {item.staffFullName}
        </div>
        <div>
          <strong>Customer:</strong> {item.customerFullName}
        </div>
      </div>

      {/* STATUS BADGE */}
      <div className="absolute bottom-4 right-4">
        <span
          className={`px-3 py-1 text-sm font-semibold rounded-lg ${getStatusBadgeClasses(
            item.status
          )}`}
        >
          {item.status}
        </span>
      </div>

      {/* MENU */}
      <MoreHorizontal
        className="absolute top-4 right-4 text-gray-400 cursor-pointer"
        size={18}
      />
    </div>
  );
};

// -------------------------
// Main Component
// -------------------------
const ScheduleBoard: React.FC = () => {
  const { groupId: groupIdString } = useParams<{ groupId: string }>()
  const groupId = groupIdString ? parseInt(groupIdString, 10) : 0
  const [schedules, setSchedules] = useState<ScheduleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [receivedRentals, setReceivedRentals] = useState<any[]>([]);
  const [formError, setFormError] = useState("");

  // POPUP STATE
  const [openModal, setOpenModal] = useState(false);

  // FORM STATE
  const [form, setForm] = useState({
    deliveryTime: "",
    startTime: "",
    endTime: "",
    finishTime: "",
    activityTypeGroupId: groupId,
    rentalId: 0,
  });

  const staffId = 1; // ← Replace with real staffId from AuthContext if needed

  // Fetch schedules
  const loadData = async () => {
    try {
      const res = await getAllScheduleByGroupIdAsync(groupId);
      if (res.success) setSchedules(res.data);
    } catch (e) {
      console.error("Error loading schedules:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const load = async () => {
    await loadData(); // existing schedule load

    try {
      const res = await getReceivedRentalByStaffIdAsync(staffId);
      if (res.success) setReceivedRentals(res.data);
    } catch (err) {
      console.error("Failed to load rentals for staff:", err);
    }
  };

  load();
}, [groupId]);

  useEffect(() => {
    loadData();
  }, [groupId]);

  // Handle form change
  const updateForm = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Submit create schedule
const handleCreate = async () => {
  if (
    !form.deliveryTime ||
    !form.startTime ||
    !form.endTime ||
    !form.finishTime ||
    !form.rentalId
  ) {
    setFormError("Please complete all fields");
    return;
  }

  try {
    const res = await addScheduleAsync(staffId, form);

    // API returns { success: false, message: "..." }
    if (res && res.success === false) {
      setFormError(res.message || "Failed to create schedule");
      return;   // keep modal open
    }

    // Success
    setOpenModal(false);
    setFormError("");
    await loadData();
    
  } catch (err: any) {
    const apiMsg = err?.response?.data?.message;
    setFormError(apiMsg || "Failed to create schedule");
    console.error(err);
  }
};


  if (loading) return <p className="text-gray-500 p-6">Loading schedules...</p>;

  // FILTER
  const filteredGroups = schedules
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.eventLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.staffFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.customerFullName.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Schedule Board</h1>

        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          New Schedule
        </button>
      </div>

      {/* Search */}
      <div className="w-full sm:w-72">
        <input
          type="text"
          placeholder="Search schedules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* DATE COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group, index) => {
          const date = new Date(group.eventDate).toLocaleDateString();

          return (
            <div
              key={index}
              className="flex flex-col bg-gray-50 p-4 rounded-xl border border-gray-200 
                         max-h-[600px] overflow-y-auto scroll-smooth"
            >
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-50 pb-2">
                <h2 className="font-semibold text-gray-800">{date}</h2>
                <div className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">
                  {group.items.length}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {group.items.map((item, idx) => (
                  <ScheduleCard item={item} key={idx} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------- */}
      {/*      CREATE MODAL        */}
      {/* ------------------------- */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] p-6 rounded-xl shadow-lg space-y-4 relative">

            {/* Close */}
            <button
              onClick={() => setOpenModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold text-gray-800">
              Create New Schedule
            </h2>

            {formError && (
              <div className="text-red-600 text-sm bg-red-100 border border-red-300 px-3 py-2 rounded">
                {formError}
              </div>
            )}

            {/* FORM */}
            <div className="space-y-3">

<div>
  <label className="block text-sm font-medium text-gray-700">
    Select Rental
  </label>

  <select
    value={form.rentalId}
    onChange={(e) => updateForm("rentalId", Number(e.target.value))}
    className="w-full px-3 py-2 border rounded-lg bg-white"
  >
    <option value={0}>-- Select a rental --</option>

    {receivedRentals.map((rental: any) => (
      <option key={rental.id} value={rental.id}>
        #{rental.id} — {rental.eventName} ({rental.eventActivityName})
      </option>
    ))}
  </select>

  {/* RENTAL EXTRA DETAILS */}
  {form.rentalId !== 0 && (
    <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
      {(() => {
        const selected = receivedRentals.find(r => r.id === form.rentalId);
        if (!selected) return null;

        return (
          <>
            <div><strong>Event:</strong> {selected.eventName}</div>
            <div><strong>Activity:</strong> {selected.eventActivityName}</div>
            <div><strong>Customer:</strong> {selected.customerName}</div>
            <div><strong>Date:</strong> {new Date(selected.eventDate).toLocaleDateString()}</div>
          </>
        );
      })()}
    </div>
  )}
</div>


              <div>
                <label className="block text-sm">Delivery Time</label>
                <input
                  type="time"
                  value={form.deliveryTime}
                  onChange={(e) => updateForm("deliveryTime", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm">Start Time</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => updateForm("startTime", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm">End Time</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => updateForm("endTime", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm">Finish Time</label>
                <input
                  type="time"
                  value={form.finishTime}
                  onChange={(e) => updateForm("finishTime", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              onClick={handleCreate}
              className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 hover:bg-blue-700"
            >
              Create Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleBoard;

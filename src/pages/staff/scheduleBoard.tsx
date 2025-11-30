import React, { useEffect, useState } from "react";
import { MapPin, MoreHorizontal, Plus, X } from "lucide-react";
import { 
  getAllScheduleByGroupIdAsync, 
  addScheduleAsync,
  updateScheduleAsync 
} from "../../apis/groupSchedule.staff.api";
import { getReceivedRentalByStaffIdAsync } from "../../apis/rental.staff.api";
import { useAuth } from "../../contexts/AuthContext";  
import ModalPortal from "../../components/staff/ModalPortal";
import { useParams } from "react-router-dom";

// -------------------------
// Types
// -------------------------
type ScheduleItem = {
  id: number;
  eventName: string;
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
// Schedule Card Component
// -------------------------
const ScheduleCard = ({
  item,
  onEdit,
  canEdit
}: {
  item: ScheduleItem;
  onEdit: () => void;
  canEdit: boolean;
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col gap-4 relative">
      
      {/* --------------------------- */}
      {/* LOCATION + EVENT NAME ROW */}
      {/* --------------------------- */}
      <div className="flex items-center justify-between w-full text-gray-800">

        {/* LEFT: LOCATION */}
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-indigo-600" />
          <div className="font-semibold">{item.eventLocation}</div>
          <span className="text-sm text-gray-500">({item.eventCity})</span>
        </div>

        {/* RIGHT: EVENT NAME */}
        <div className="text-sm font-semibold text-indigo-600 whitespace-nowrap ml-4">
          {item.eventName}
        </div>
      </div>

      {/* TIME */}
      <div className="text-gray-700 text-sm space-y-1 mt-1 text-center">
        <div><strong>Delivery:</strong> {item.deliveryTime}</div>
        <div><strong>Start – End:</strong> {item.startTime} – {item.endTime}</div>
        <div><strong>Finish:</strong> {item.finishTime}</div>
      </div>

      {/* STAFF */}
      <div className="mt-3 text-xs text-gray-600">
        <div><strong>Staff:</strong> {item.staffFullName}</div>
        <div><strong>Customer:</strong> {item.customerFullName}</div>
        <div><strong>Rental ID:</strong> {item.rentalId}</div>
      </div>

      {/* STATUS BADGE */}
      <div className="absolute bottom-4 right-4">
        <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${getStatusBadgeClasses(item.status)}`}>
          {item.status}
        </span>
      </div>

      {/* EDIT BUTTON */}
      {canEdit && (
        <MoreHorizontal
          className="absolute top-4 right-4 text-gray-400 cursor-pointer"
          size={18}
          onClick={onEdit}
        />
      )}
    </div>
  );
};

// -------------------------
// Main Component
// -------------------------
const ScheduleBoard = ({ groupId, onBack }: { groupId: number; onBack: () => void }) => {

  const { user } = useAuth();   // ⬅️ GET LOGGED-IN STAFF

const loggedStaffId = user?.accountId ? Number(user.accountId) : undefined;

  const [schedules, setSchedules] = useState<ScheduleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [receivedRentals, setReceivedRentals] = useState<any[]>([]);
  const [formError, setFormError] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
const scheduledRentalIds = schedules
  .flatMap(g => g.items)
  .map(i => i.rentalId);

  const [form, setForm] = useState({
    deliveryTime: "",
    startTime: "",
    endTime: "",
    finishTime: "",
    activityTypeGroupId: groupId,
    rentalId: 0,
  });

  // -------------------------
  // Load Schedules
  // -------------------------
  const loadData = async () => {
    try {
      const res = await getAllScheduleByGroupIdAsync(groupId);
      if (res.success) setSchedules(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadData();

      // load rentals for select dropdown
      const res = await getReceivedRentalByStaffIdAsync(Number(loggedStaffId));
      if (res.success) setReceivedRentals(res.data);
    };

    if (loggedStaffId) load();
  }, [groupId, loggedStaffId]);

  const updateForm = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () =>
    form.deliveryTime && form.startTime && form.endTime && form.finishTime && form.rentalId;

  // -------------------------
  // CREATE
  // -------------------------
const handleCreate = async () => {
  if (!isFormValid()) {
    setFormError("Please complete all fields");
    return;
  }

  const res = await addScheduleAsync(Number(loggedStaffId), form);

  if (!res.success) {
    setFormError(res.message);
    return;
  }

  setOpenModal(false);
  await loadData();
};

  // -------------------------
  // UPDATE
  // -------------------------
const handleUpdate = async () => {
  console.log("===== UPDATE DEBUG =====");
  console.log("Schedule ID:", editingId);
  console.log("Payload sent to API:", {
    ...form,
    deliveryTime: form.deliveryTime,
    startTime: form.startTime,
    endTime: form.endTime,
    finishTime: form.finishTime,
    rentalId: form.rentalId,
    activityTypeGroupId: form.activityTypeGroupId,
  });
  console.log("========================");

  if (!editingId) return;

  const owner = schedules
    .flatMap(g => g.items)
    .find(i => i.id === editingId)?.staffId;

  if (owner !== loggedStaffId) {
    alert("❌ You cannot edit this schedule. It belongs to another staff.");
    return;
  }

  // 🔥 CALL API
  const res = await updateScheduleAsync(editingId, form);

  // 🔥 CHECK DUPLICATE CONFLICT
  if (res.success === false) {
    setFormError(res.message || "Cannot update schedule.");
    return;
  }

  setOpenModal(false);
  await loadData();
};

  // -------------------------
  // OPEN UPDATE MODAL
  // -------------------------
const openUpdateModal = (item: ScheduleItem) => {
  if (item.staffId !== loggedStaffId) {
    alert("❌ You can only update schedules you created.");
    return;
  }

  setIsUpdate(true);
  setEditingId(item.id);

  setForm({
    deliveryTime: item.deliveryTime,
    startTime: item.startTime,
    endTime: item.endTime,
    finishTime: item.finishTime,
    rentalId: item.rentalId,
    activityTypeGroupId: item.activityTypeGroupId,
  });

  setFormError("");   // <---- IMPORTANT
  setOpenModal(true);
};

  // -------------------------
  // Filter Schedules
  // -------------------------
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

  if (loading) return <p className="p-6 text-gray-500">Loading schedules...</p>;

  return (
  <div className="min-h-screen p-6 space-y-6 bg-gray-50">
      {/* ===================== */}
      {/*        BACK BTN       */}
      {/* ===================== */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
      >
        ← Back to Robot Groups
      </button>
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Schedule Board</h1>

        <button
          onClick={() => {
            setIsUpdate(false);
            setEditingId(null);
            setForm({
              deliveryTime: "",
              startTime: "",
              endTime: "",
              finishTime: "",
              rentalId: 0,
              activityTypeGroupId: groupId,
            });
            setFormError("");
            setOpenModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          New Schedule
        </button>
      </div>

      {/* SEARCH */}
      <div className="w-full sm:w-72">
        <input
          type="text"
          placeholder="Search schedules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group, index) => {
          const date = new Date(group.eventDate).toLocaleDateString();

          return (
            <div key={index} className="bg-gray-50 p-4 border rounded-xl max-h-[600px] overflow-y-auto">
              <div className="flex justify-between mb-4">
                <h2 className="font-semibold">{date}</h2>
                <div className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">
                  {group.items.length}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {group.items.map((item) => (
                  <ScheduleCard
                    key={item.id}
                    item={item}
                    canEdit={item.staffId === loggedStaffId}
                    onEdit={() => openUpdateModal(item)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
{openModal && (
  // Overlay wrapper
    <ModalPortal>
<div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-[9999] p-4">
    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
      {/* Close Button */}
      <button
        onClick={() => setOpenModal(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <X size={20} />
      </button>

      <h2 className="text-xl font-semibold text-gray-800 text-center">
        {isUpdate ? "Update Schedule" : "Create Schedule"}
      </h2>

      {formError && (
        <div className="text-red-600 text-sm bg-red-100 border border-red-300 px-3 py-2 rounded">
          {formError}
        </div>
      )}

      <div className="space-y-4">
        {/* RENTAL SELECT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Rental
          </label>
<select
  value={form.rentalId}
  disabled={isUpdate}
  onChange={(e) => {
    const rid = Number(e.target.value);
    updateForm("rentalId", rid);

    if (!isUpdate) {
      const rental = receivedRentals.find((r: any) => r.id === rid);
      if (rental) {
        updateForm("startTime", rental.startTime);
        updateForm("endTime", rental.endTime);
      }
    }
  }}
  className={`w-full px-3 py-2 border border-gray-300 rounded-lg bg-white 
              ${isUpdate ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "cursor-pointer"}
              focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
>
  <option value={0}>-- Select a rental --</option>

  {receivedRentals
    .filter((r: any) => isUpdate || !scheduledRentalIds.includes(r.id))
    .map((r: any) => (
      <option key={r.id} value={r.id}>
        #{r.id} — {r.eventName}
      </option>
    ))}
</select>

        </div>

        {/* Delivery Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Time
          </label>
          <input
            type="time"
            value={form.deliveryTime}
            onChange={(e) => updateForm("deliveryTime", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <input
            type="time"
            value={form.startTime}
            disabled={true}
            onChange={(e) => updateForm("startTime", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <input
            type="time"
            value={form.endTime}
            disabled={true}
            onChange={(e) => updateForm("endTime", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Finish Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Finish Time
          </label>
          <input
            type="time"
            value={form.finishTime}
            onChange={(e) => updateForm("finishTime", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={isUpdate ? handleUpdate : handleCreate}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {isUpdate ? "Update Schedule" : "Create Schedule"}
      </button>
    </div>
  </div>
  </ModalPortal>
)}

    </div>
  );
};

export default ScheduleBoard;

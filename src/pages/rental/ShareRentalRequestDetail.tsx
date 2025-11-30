import { Clock, Phone, Mail, User, Hash, Calendar, PenSquare, ArrowLeft, MapPin} from "lucide-react";
import { useEffect, useState } from "react";
import { getRentalByIdAsync, staffRequestUpdateRentalAsync } from "../../apis/rental.staff.api";
import { getRentalDetailsByRentalIdAsync } from "../../apis/rentaldetail.api";
import { useRef } from "react";
import { getGroupScheduleByRentalIdForCustomerAsync } from "../../apis/groupSchedule.customer.api";
import { useAuth } from "../../contexts/AuthContext";
import { useParams } from "react-router-dom";

interface ShareRentalRequestDetailProps {
  onBack: () => void;
  onNavigateToScheduleBoard?: (groupId: number) => void;
}

export default function ShareRentalRequestDetail({ onBack, onNavigateToScheduleBoard }: ShareRentalRequestDetailProps) {
const { user } = useAuth();
const userRole = user?.role; // "Customer", "Staff", "Manager", etc.
  const { rentalId: rentalIdString } = useParams<{ rentalId: string }>()
  const rentalId = rentalIdString ? parseInt(rentalIdString, 10) : 0
  const [rental, setRental] = useState<any>(null);
  const [rentalDetails, setRentalDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
const detailRef = useRef<HTMLDivElement | null>(null);

  // Grouping state
  const [grouped, setGrouped] = useState<any[]>([]);
  const [activeType, setActiveType] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  // Load all images in assets folder automatically
const imageModules = import.meta.glob("../../assets/*.{png,jpg,jpeg}", {
  eager: true,
});

const [schedule, setSchedule] = useState<any | null>(null);
const scheduleRef = useRef<HTMLDivElement | null>(null);
const [viewMode, setViewMode] = useState<"details" | "schedule">("details");

// Normalize robot type name → usable filename
const cleanFileName = (name: string) => {
  return name
    .replace(/\//g, "")     // remove slash
    .replace(/\s+/g, " ")   // normalize spaces
    .trim()
    .replace(/ /g, "_");     // replace spaces with underscores
};

const getRobotImage = (name: string) => {
  const clean = cleanFileName(name); // "Dance_Choreography_Robot"

  const entries = Object.entries(imageModules);

  const match = entries.find(([path]) =>
    path.toLowerCase().includes(clean.toLowerCase())
  );

  return match ? (match[1] as any).default : "";
};

const loadSchedule = async () => {
  try {
    const res = await getGroupScheduleByRentalIdForCustomerAsync(rentalId);
    if (res.success) {
      setSchedule(res.data);
    }
  } catch (err) {
    console.error("Failed to load schedule:", err);
  }
};

  // =======================
  // FETCH RENTAL & DETAILS
  // =======================
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);

        const rentalRes = await getRentalByIdAsync(rentalId);
        setRental(rentalRes);

        const detailRes = await getRentalDetailsByRentalIdAsync(rentalId);
        if (detailRes.success) setRentalDetails(detailRes.data);

      } catch (err) {
        console.error("Failed to load rental detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [rentalId]);

  // =======================
  // GROUP DETAILS BY ROBOT TYPE
  // =======================
  useEffect(() => {
    if (rentalDetails.length === 0) return;

    const map: Record<number, any[]> = {};

    rentalDetails.forEach((d) => {
      if (!map[d.roboTypeId]) map[d.roboTypeId] = [];
      map[d.roboTypeId].push(d);
    });

    const groups = Object.keys(map).map((id) => ({
      roboTypeId: Number(id),
      robotTypeName: map[Number(id)][0].robotTypeName,
      robotTypeDescription: map[Number(id)][0].robotTypeDescription,
      items: map[Number(id)]
    }));

    setGrouped(groups);

    // set default active tab
    if (!activeType && groups.length > 0) {
      setActiveType(groups[0].roboTypeId);
      setPage(0);
    }

  }, [rentalDetails]);

  // =======================
  // LOADING / ERROR STATES
  // =======================
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading rental details...</p>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load rental details.</p>
        <button onClick={onBack} className="text-blue-600 underline mt-2">Go Back</button>
      </div>
    );
  }

  // =======================
  // FORMATTED DATES
  // =======================
  const createdDate = new Date(rental.createdDate).toLocaleDateString();
  const updatedDate = new Date(rental.updatedDate).toLocaleDateString();
  const eventDate = new Date(rental.eventDate).toLocaleDateString();

  // =======================
  // GET CURRENT GROUP AND ITEM
  // =======================
  const currentGroup = grouped.find((g) => g.roboTypeId === activeType);
  const currentItem = currentGroup ? currentGroup.items[page] : null;

  return (
    <div className="p-6 space-y-6">

      {/* BACK BUTTON */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
      >
        <ArrowLeft size={18} />
        Back to Requests
      </button>

      {/* PAGE TITLE */}
      <h1 className="text-2xl font-bold text-gray-800">
        Rental Request: <span className="font-semibold">{rental.eventName}</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SECTION */}
        <div className="space-y-6 lg:col-span-1">

          {/* Rental Information */}
          <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Rental Information</h2>

            <div className="space-y-3 text-sm text-gray-700">

              <div className="flex items-center gap-3">
                <PenSquare size={16} className="text-blue-600" />
                <span><strong>Event Name:</strong> {rental.eventName}</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={16} className="text-blue-600" />
                <span><strong>Email:</strong> {rental.email}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={16} className="text-blue-600" />
                <span><strong>Phone:</strong> {rental.phoneNumber}</span>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-blue-600" />
                <span><strong>Created Date:</strong> {createdDate}</span>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-blue-600" />
                <span><strong>Updated Date:</strong> {updatedDate}</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock size={16} className="text-yellow-500" />
                <span><strong>Status:</strong> {rental.status}</span>
              </div>

              <div className="flex items-center gap-3">
                <User size={16} className="text-green-600" />
                <span><strong>Account ID:</strong> {rental.accountId}</span>
              </div>

              <div className="flex items-center gap-3">
                <Hash size={16} className="text-green-600" />
                <span><strong>Event Activity:</strong> {rental.eventActivityName}</span>
              </div>

              <div className="flex items-center gap-3">
                <Hash size={16} className="text-green-600" />
                <span><strong>Activity Type:</strong> {rental.activityTypeName}</span>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-blue-600" />
                <span><strong>Event Date:</strong> {eventDate}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Actions</h2>

<div className="space-y-3">

  <button
    onClick={() => setViewMode("details")}
    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
  >
    View Details
  </button>

  <button
    onClick={async () => {
      setViewMode("schedule");
      await loadSchedule();
      if (scheduleRef.current) {
        scheduleRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }}
    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
  >
    View Schedules
  </button>

{(rental.status !== "Draft" && rental.status !== "Pending") && (
  <button className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100">
    Chat
  </button>
)}

{/* REQUEST UPDATE BUTTON — hidden if Scheduled OR Customer */}
{(userRole === "staff" && rental.status === "Received") && (
  <button
    onClick={async () => {
      try {
        const res = await staffRequestUpdateRentalAsync(rentalId);

        if (res.success) {
          alert("Request update has been sent successfully!");
          onBack();
        } else {
          alert(res.message || "Failed to request update.");
        }

      } catch (err) {
        console.error("Failed to request update:", err);
        alert("Something went wrong. Please try again.");
      }
    }}
    className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600"
  >
    Request Update
  </button>
)}

</div>

          </div>

        </div>

{/* ======================= */}
{/* RIGHT SECTION — GROUPED */}
{/* ======================= */}
<div className="lg:col-span-2 flex flex-col h-full pb-6">

  {/* TAB BUTTONS */}
{viewMode === "details" && (
  <div className="flex flex-wrap gap-3 mb-4">
    {grouped.map((g) => (
      <button
        key={g.roboTypeId}
        onClick={() => {
          setActiveType(g.roboTypeId);
          setPage(0);
        }}
        className={`
          px-4 py-2 rounded-lg font-medium border 
          ${activeType === g.roboTypeId
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }
        `}
      >
        {g.robotTypeName}
      </button>
    ))}
  </div>
)}

{/* DETAIL CARD */}
{viewMode === "details" && currentItem && currentGroup ? (
<div
  ref={detailRef}
  className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col h-full"
>

    <div className="flex flex-col lg:flex-row gap-8 flex-1">

      {/* IMAGE SECTION */}
      <div className="w-full lg:w-1/3 flex justify-center items-start">
        <img
          src={getRobotImage(currentGroup.robotTypeName)}
          alt={currentGroup.robotTypeName}
          className="w-full h-auto object-cover rounded-xl border shadow-sm"
        />
      </div>

      {/* RIGHT SECTION */}
      <div className="flex-1 flex flex-col">

        {/* TITLE */}
        <h2 className="text-xl font-semibold text-gray-800 text-left">
          {currentGroup.robotTypeName}
        </h2>

        <p className="text-gray-600 italic mb-4 text-left">
          {currentGroup.robotTypeDescription}
        </p>

        {/* FIELD INPUT-STYLE BOXES */}
        <div className="space-y-4">

          <div>
            <label className="font-semibold text-gray-700">Script</label>
            <input
              disabled
              className="w-full mt-1 p-2 rounded-md border border-gray-300 bg-gray-100"
              value={currentItem.script}
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Branding</label>
            <input
              disabled
              className="w-full mt-1 p-2 rounded-md border border-gray-300 bg-gray-100"
              value={currentItem.branding}
            />
          </div>

        </div>

      </div>
    </div>

    {/* SCENARIO FULL-WIDTH BELOW IMAGE */}
    <div className="mt-10">
      <label className="font-semibold text-gray-700">Scenario</label>
      <textarea
        disabled
        className="w-full mt-2 p-3 rounded-md border border-gray-300 bg-gray-100 min-h-[120px]"
        value={currentItem.scenario}
      />
    </div>
{/* PAGINATION AT VERY BOTTOM */}
<div className="flex justify-end items-center gap-6 mt-6">

  <button
    onClick={() => setPage(page - 1)}
    disabled={page === 0}
    className={`px-4 py-2 rounded-lg border ${
      page === 0
        ? "border-gray-200 text-gray-400 cursor-not-allowed"
        : "border-gray-300 text-gray-700 hover:bg-gray-100"
    }`}
  >
    Previous
  </button>

  <span className="text-gray-600 text-sm">
    {page + 1} / {currentGroup.items.length}
  </span>

  <button
    onClick={() => setPage(page + 1)}
    disabled={page === currentGroup.items.length - 1}
    className={`px-4 py-2 rounded-lg border ${
      page === currentGroup.items.length - 1
        ? "border-gray-200 text-gray-400 cursor-not-allowed"
        : "border-gray-300 text-gray-700 hover:bg-gray-100"
    }`}
  >
    Next
  </button>

</div>

  </div>
) : viewMode === "details" ? (
  <p className="text-gray-500 italic">Select a robot type</p>
) : null}

{/* ======================= */}
{/*   SCHEDULE SECTION      */}
{/* ======================= */}
{viewMode === "schedule" && (
  <div ref={scheduleRef} className="mt-10">

  <h2 className="text-xl font-semibold text-gray-800 mb-4">
    Event Schedule
  </h2>

  {!schedule ? (
    <p className="text-sm text-gray-500 italic">Click “View Schedules” to show event schedule.</p>
  ) : (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-4">

      {/* LOCATION */}
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-indigo-600" />
        <span className="font-semibold text-gray-800">{schedule.eventLocation}</span>
        <span className="text-gray-500 text-sm">({schedule.eventCity})</span>
      </div>

      {/* TIMES */}
      <div className="text-sm text-gray-700 space-y-1">
        <div><strong>Delivery:</strong> {schedule.deliveryTime}</div>
        <div><strong>Start – End:</strong> {schedule.startTime} – {schedule.endTime}</div>
        <div><strong>Finish:</strong> {schedule.finishTime}</div>
      </div>

      {/* STATUS BADGE */}
      <div>
        <span
          className={`px-3 py-1 text-sm font-semibold rounded-lg 
            ${schedule.status === "planned" ? "bg-yellow-200 text-yellow-900" : ""}
            ${schedule.status === "completed" ? "bg-green-200 text-green-900" : ""}
            ${schedule.status === "cancelled" ? "bg-red-200 text-red-900" : ""}
          `}
        >
          {schedule.status}
        </span>
      </div>

      {/* STAFF & CUSTOMER */}
      <div className="text-xs text-gray-600 space-y-1">
        <div><strong>Staff:</strong> {schedule.staffFullName}</div>
        <div><strong>Customer:</strong> {schedule.customerFullName}</div>
        <div><strong>Rental ID:</strong> {schedule.rentalId}</div>
      </div>
{(userRole === "staff") && (
<button
  onClick={() => {
    console.log("test:" + schedule.activityTypeGroupId)
    console.log("callback exists:", typeof onNavigateToScheduleBoard);
    if (schedule && onNavigateToScheduleBoard) {
      onNavigateToScheduleBoard(schedule.activityTypeGroupId);
      console.log("ClickKkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk")
    }
  }}
  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 mt-4"
>
  View Full Schedule Board
</button>
)}
    </div>
  )}
</div>
)}

</div>

      </div>
    </div>
  );
}

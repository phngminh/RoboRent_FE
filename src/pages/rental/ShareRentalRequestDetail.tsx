import { 
  CheckCircle, Clock, Phone, Mail, User, Hash, Calendar, PenSquare, ArrowLeft 
} from "lucide-react";
import { useEffect, useState } from "react";
import { getRentalByIdAsync } from "../../apis/rental.staff.api";
import { getRentalDetailsByRentalIdAsync } from "../../apis/rentaldetail.api";

interface ShareRentalRequestDetailProps {
  rentalId: number;
  onBack: () => void;
}

export default function ShareRentalRequestDetail({ rentalId, onBack }: ShareRentalRequestDetailProps) {

  const [rental, setRental] = useState<any>(null);
  const [rentalDetails, setRentalDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Grouping state
  const [grouped, setGrouped] = useState<any[]>([]);
  const [activeType, setActiveType] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  // Load all images in assets folder automatically
const imageModules = import.meta.glob("../../assets/*.{png,jpg,jpeg}", {
  eager: true,
});

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
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
                Approve Request
              </button>

              <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700">
                Reject Request
              </button>

              <button className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100">
                Contact Client
              </button>

              <button className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100">
                View Event Page
              </button>
            </div>
          </div>

        </div>

{/* ======================= */}
{/* RIGHT SECTION — GROUPED */}
{/* ======================= */}
<div className="lg:col-span-2 flex flex-col h-full pb-6">

  {/* TAB BUTTONS */}
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

{/* DETAIL CARD */}
{currentItem && currentGroup ? (
  <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col h-full">

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
) : (
  <p className="text-gray-500 italic">Select a robot type</p>
)}

</div>

      </div>
    </div>
  );
}

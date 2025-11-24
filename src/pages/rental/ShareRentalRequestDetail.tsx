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

  // =======================
  // FETCH RENTAL & DETAILS
  // =======================
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);

        // Fetch rental main info
        const rentalRes = await getRentalByIdAsync(rentalId);
        setRental(rentalRes);

        // Fetch rental detail list
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
  // FORMATTED FIELDS
  // =======================
  const createdDate = new Date(rental.createdDate).toLocaleDateString();
  const updatedDate = new Date(rental.updatedDate).toLocaleDateString();
  const eventDate = new Date(rental.eventDate).toLocaleDateString();

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

        {/* RIGHT SECTION — AUTO GENERATED CARDS */}
        <div className="lg:col-span-2 space-y-6">

          {/* Rental Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {rentalDetails.length === 0 && (
              <p className="text-gray-500 italic">No rental details found.</p>
            )}

            {rentalDetails.map((detail, index) => (
              <div 
                key={detail.id || index}
                className="bg-white p-5 rounded-xl shadow border border-gray-100"
              >
                <h3 className="font-semibold text-gray-800 mb-3">
                  Detail #{index + 1}
                </h3>

                <div className="space-y-1 text-sm text-gray-700">
                  <p><strong>RoboType ID:</strong> {detail.roboTypeId}</p>
                  <p><strong>Script:</strong> {detail.script || "N/A"}</p>
                  <p><strong>Branding:</strong> {detail.branding || "N/A"}</p>
                  <p><strong>Scenario:</strong> {detail.scenario || "N/A"}</p>
                </div>
              </div>
            ))}

          </div>

          {/* Internal Notes */}
          <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Internal Notes</h2>

            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 h-32 text-sm text-gray-700"
              defaultValue={`Initial contact made. Client expressed interest in theme...`}
            />

            <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
              Save Notes
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

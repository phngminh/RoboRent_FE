import React, { useEffect, useState } from 'react'
import { Upload, CheckCircle } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { 
  getFaceProfileByAccountIdAsync,
  getAllFaceVerificationsByAccountIdAsync
} from "../../../apis/biometric.verification.api";

interface FaceProfilePageProps {
  onNotFound: () => void
  onUpdate: () => void
  onVerify: () => void
}

const FaceProfilePage: React.FC<FaceProfilePageProps> = ({ onNotFound, onUpdate, onVerify }) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [profile, setProfile] = useState<any>({
    citizen_id: "",
    image_url: "",
    model: "",
    hash: "",
    created_at: "",
    last_used: "",
    active: false,
  });

  // HISTORY STATES
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [historyList, setHistoryList] = useState<any[]>([]);

  // ------------------------------------------------
  // LOAD PROFILE
  // ------------------------------------------------
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.accountId) return;

      setLoading(true);

      const res = await getFaceProfileByAccountIdAsync(user.accountId);

      if (!res.success) {
        onNotFound();
        setNotFound(true);
        setProfile({
          citizen_id: "",
          image_url: "",
          model: "",
          hash: "",
          created_at: "",
          last_used: "",
          active: false,
        });
      } else {
        const p = res.data;

        setNotFound(false);
        setProfile({
          citizen_id: p.citizenId || "",
          image_url: p.frontIdImagePath || "",
          model: p.model || "",
          hash: p.hashSha256 || "",
          created_at: p.createdAt ? new Date(p.createdAt).toLocaleString() : "",
          last_used: p.lastUsedAt ? new Date(p.lastUsedAt).toLocaleString() : "",
          active: p.isActive,
        });
      }

      setLoading(false);
    };

    loadProfile();
  }, [user?.accountId]);

  // ------------------------------------------------
  // LOAD FACE VERIFICATION HISTORY
  // ------------------------------------------------
  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.accountId) return;

      setHistoryLoading(true);
      setHistoryError("");

      const res = await getAllFaceVerificationsByAccountIdAsync(user.accountId);

      if (!res.success) {
        setHistoryError(res.message || "Failed to load verification history");
        setHistoryList([]);
      } else {
        setHistoryList(res.data || []);
      }

      setHistoryLoading(false);
    };

    loadHistory();
  }, [user?.accountId]);

  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800">
        Face Profile Management
      </h1>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <>
          {/* ---------------------------------------------- */}
          {/* SECTION 1: Citizen ID + Buttons */}
          {/* ---------------------------------------------- */}
          <div className="bg-white shadow rounded-xl p-6 space-y-4">
            {notFound && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm">
                No face profile found. Please create your biometric face profile.
              </div>
            )}

            <div className="flex items-start gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-gray-600 text-sm">Citizen ID</label>
                  <input
                    className="w-full mt-1 border rounded-md px-3 py-2"
                    value={profile.citizen_id}
                    readOnly
                    placeholder="Not available"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    disabled={notFound}
                    onClick={onUpdate}
                    className="px-4 py-2 bg-gray-100 rounded-lg flex items-center gap-2 text-gray-700 border disabled:opacity-50"
                  >
                    <Upload size={18} /> Update FaceProfile
                  </button>
                </div>
              </div>
            </div>

            <p className="text-gray-500 text-sm">
              Ensure your image is clear, well-lit, and meets our biometric guidelines.
            </p>
          </div>

          {/* ---------------------------------------------- */}
          {/* SECTION 2: Biometric Profile Details */}
          {/* ---------------------------------------------- */}
          <div className="bg-white shadow rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold">Biometric Profile Details</h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600">Biometric Model Name</label>
                <input
                  value={profile.model}
                  readOnly
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Hash SHA256</label>
                <input
                  value={profile.hash}
                  readOnly
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Created At</label>
                <input
                  value={profile.created_at}
                  readOnly
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Last Used At</label>
                <input
                  value={profile.last_used}
                  readOnly
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Active Status</label>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  profile.active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {profile.active ? "Active" : "Inactive"}
              </div>
            </div>

            <p className="text-gray-500 text-sm">
              Biometric data processed and embedding field hidden for security.
            </p>
          </div>

          {/* ---------------------------------------------- */}
          {/* SECTION 3: Status */}
          {/* ---------------------------------------------- */}
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 flex items-center gap-3">
            <CheckCircle className="text-purple-600" size={24} />
            <div>
              <p className="font-semibold text-purple-700">Status</p>
              <p className="text-purple-600 text-sm">
                {notFound ? "No biometric profile found." : "Your biometric profile is active."}
              </p>
            </div>
          </div>

          {/* ----------------------------------------------------- */}
          {/* SECTION 4: Biometric Submission History */}
          {/* ----------------------------------------------------- */}
          <div className="bg-white shadow rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Biometric Submission History</h2>

            {historyLoading && (
              <p className="text-gray-600">Loading history...</p>
            )}

            {!historyLoading && historyError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {historyError}
              </div>
            )}

{/* No history → show yellow box + verify button */}
{!historyLoading && historyError === "" && historyList.length === 0 && (
  <>
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
      No biometric verification history found.
    </div>

    <button
      onClick={onVerify}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg mt-3"
    >
      Verify Now
    </button>
  </>
)}

            {/* SHOW TABLE IF HISTORY EXISTS */}
            {historyList.length > 0 && (
              <table className="w-full text-left border-t">
                <thead>
                  <tr className="text-gray-600 text-sm border-b">
                    <th className="py-2">Date</th>
                    <th>Submission Type</th>
                    <th>Status</th>
                    <th>Match Score</th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.map((item) => (
                    <tr key={item.id} className="border-b text-sm">
                      <td className="py-2">
                        {new Date(item.verifiedAt).toLocaleString()}
                      </td>

                      <td>
                        {item.rentalId ? "Rental Verification" : "Face Verification"}
                      </td>

                      <td>
                        {item.result === "Success" ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            Approved
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                            Rejected
                          </span>
                        )}
                      </td>

                      <td className="text-gray-600">{item.matchScore?.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FaceProfilePage;

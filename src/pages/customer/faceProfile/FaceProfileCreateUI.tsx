import { useState, useRef } from "react";
import { Upload, X, CheckCircle } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { createFaceProfileCCCD } from "../../../apis/biometric.verification.api";
import { toast } from "react-toastify";

export default function FaceProfileCreateUI({ onSubmit }: { onSubmit?: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [citizenId, setCitizenId] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done">("idle");

  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const uploadFile = (file: File) => {
    setUploadedFile(file);
    setUploadStatus("uploading");

    // simulate upload
    setTimeout(() => {
      setUploadStatus("done");
    }, 1500);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1]; // remove prefix
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const handleSubmit = async () => {
  if (!uploadedFile) return;

  setIsSubmitting(true);   // 🔥 SHOW LOADING

  try {
    const base64Img = await convertFileToBase64(uploadedFile);

    const payload = {
      account_id: user?.accountId,
      citizen_id: citizenId,
      image_base64: base64Img,
    };

    const result = await createFaceProfileCCCD(payload);

    if (result.success) {
      toast.success("Face profile created successfully!");
      onSubmit?.();
    } else {
      setErrorMessage(result.message);
      toast.error(result.message);
    }
  } catch (err) {
    toast.error("An unexpected error occurred.");
  } finally {
    setIsSubmitting(false);  // 🔥 REMOVE LOADING
  }
};


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">

      {/* CONTENT CARD */}
      <div className="max-w-2xl w-full px-6 py-10">
        <h2 className="text-3xl font-bold text-center text-gray-800">Biometric Verification</h2>
        <p className="text-center text-gray-600 mt-2">
          Securely Verify Your Identity to Access Services
        </p>

        <p className="text-center text-gray-500 mt-1">
          Please provide your Citizen ID and upload a clear image of your Vietnamese CCCD.
        </p>

{errorMessage && (
  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
    {errorMessage}
  </div>
)}

        {/* CITIZEN ID */}
        <div className="mt-10 bg-white shadow rounded-xl p-6">
          <label className="text-gray-600 font-medium">Citizen ID Number</label>
          <input
            value={citizenId}
            onChange={(e) => setCitizenId(e.target.value)}
            placeholder="e.g., 012345678912"
            className="w-full mt-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Enter the 12-digit number from your CCCD.</p>
        </div>

        {/* UPLOAD SECTION */}
        <div className="mt-6 bg-white shadow rounded-xl p-6 space-y-3">
          <label className="text-gray-600 font-medium">Front Side of CCCD</label>

          {/* DROPZONE */}
          <div
            className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
          >
            {!uploadedFile ? (
              <div className="flex flex-col items-center">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-gray-600">Drag & drop your CCCD image here, or click to browse.</p>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={18} />
                  <span>{uploadedFile.name}</span>
                </div>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setUploadStatus("idle");
                  }}
                >
                  <X className="text-gray-500 hover:text-red-500" size={18} />
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) uploadFile(e.target.files[0]);
              }}
            />
          </div>

          {/* PROGRESS BAR */}
          {uploadStatus === "uploading" && (
            <div className="mt-3">
              <p className="text-blue-600 text-sm">Image uploaded successfully. Processing...</p>
              <div className="w-full bg-blue-100 h-2 rounded-full mt-1 overflow-hidden">
                <div className="bg-blue-600 h-full animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* TIPS */}
        <div className="mt-6 bg-white shadow rounded-xl p-6">
          <h3 className="font-semibold text-gray-700 mb-2">
            Important Tips for a Successful Upload
          </h3>

          <ul className="text-gray-600 text-sm space-y-1">
            <li>• Ensure the image is well-lit and not blurry.</li>
            <li>• All text on the CCCD must be clearly legible.</li>
            <li>• The entire card must be visible within the frame.</li>
            <li>• Avoid glare, shadows, or reflections.</li>
            <li>• Image format: JPG, JPEG, PNG (Max 5MB).</li>
          </ul>
        </div>

        {/* BUTTON */}
<button
  disabled={!citizenId || !uploadedFile || uploadStatus !== "done" || isSubmitting}
  onClick={handleSubmit}
  className="w-full mt-8 bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg disabled:bg-blue-300 flex justify-center items-center gap-2"
>
  {isSubmitting ? (
    <>
      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
        />
      </svg>
      Processing...
    </>
  ) : (
    "Proceed to Verification"
  )}
</button>

        <div className="text-center mt-6 text-xs text-gray-500">
          Help • Privacy Policy
        </div>
      </div>
    </div>
  );
}

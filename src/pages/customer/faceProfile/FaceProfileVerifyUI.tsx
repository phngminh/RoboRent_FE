import React, { useState, useRef, useEffect } from "react";
import { Upload, Camera, Loader2, ArrowLeft } from "lucide-react";
import { verifyFace } from "../../../apis/biometric.verification.api";
import { useAuth } from "../../../contexts/AuthContext";

interface FaceVerificationPageProps {
  onBack: () => void;
  onSubmit: () => void;
}

const FaceVerificationPage: React.FC<FaceVerificationPageProps> = ({
  onBack,
  onSubmit
}) => {
  const { user } = useAuth();

  const [imageBase64, setImageBase64] = useState<string>("");
  const [preview, setPreview] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // ===========================
  // HANDLE UPLOAD
  // ===========================
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      setImageBase64(base64.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  // ===========================
  // START CAMERA
  // ===========================
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((err) =>
            console.log("Play blocked", err)
          );
        };
      }

      setCameraActive(true);
    } catch (err) {
      console.error("Camera Error:", err);
      setStatusMessage("Unable to access camera. Please allow camera permission.");
    }
  };

  // ===========================
  // STOP CAMERA
  // ===========================
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setCameraActive(false);
  };

  // ===========================
  // WAIT FOR VIDEO
  // ===========================
  const waitForVideo = () => {
    return new Promise<void>((resolve) => {
      if (!videoRef.current) return resolve();

      const video = videoRef.current;

      if (video.videoWidth > 0 && video.videoHeight > 0) {
        return resolve();
      }

      const check = setInterval(() => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
  };

  // ===========================
  // CAPTURE PHOTO
  // ===========================
  const capturePhoto = async () => {
    if (!videoRef.current) return;

    await waitForVideo();

    const video = videoRef.current;
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      console.log("❌ Still no dimensions — cannot capture");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    const base64 = canvas.toDataURL("image/jpeg");

    setPreview(base64);
    setImageBase64(base64.split(",")[1]);

    stopCamera();
  };

  // ===========================
  // SUBMIT VERIFICATION
  // ===========================
  const submitVerification = async () => {
    if (!imageBase64) return;

    setSubmitting(true);
    setStatusMessage("");

    const payload = {
      account_id: user?.accountId,
      image_base64: imageBase64
    };

    const api = await verifyFace(payload);
    console.log("API RESPONSE:", api);

    if (api.data.face_profile_id === 0) {
      setStatusMessage("No face profile found. Please register your face first.");
      setSubmitting(false);
      return;
    }

    if (!api.data.success) {
      setStatusMessage(
        `Face mismatch. Match score: ${api.data.match_score?.toFixed(3)}`
      );
      setSubmitting(false);
      return;
    }

    setStatusMessage("Verification successful!");
    setSubmitting(false);

    onSubmit();
  };

  return (
    <div className="w-full flex justify-center py-10">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-xl p-10 border border-gray-200">

        {/* BACK BUTTON */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-black mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h1 className="text-2xl font-semibold text-center mb-6">
          Face Verification
        </h1>

        <p className="text-center text-gray-500 mb-10">
          Securely verify your identity by uploading an image or using your device’s camera.
        </p>

        {/* ===================================== */}
        {/* MAIN LAYOUT */}
        {/* ===================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* UPLOAD PANEL */}
          <div className="border rounded-xl p-6 flex flex-col items-center text-center bg-gray-50">
            <Upload size={32} className="text-gray-600 mb-4" />

            <h2 className="text-lg font-semibold mb-2">Upload Your Image</h2>

            <p className="text-gray-500 text-sm mb-4">
              Drag and drop or browse to upload a clear face photo.
            </p>

            <label className="cursor-pointer w-full">
              <div className="bg-white border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-100">
                Browse Files
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
            </label>
          </div>

          {/* CAMERA PANEL */}
          <div className="border rounded-xl p-6 flex flex-col items-center text-center bg-gray-50">
            <Camera size={32} className="text-gray-600 mb-4" />

            <h2 className="text-lg font-semibold mb-2">Use Live Camera</h2>
            <p className="text-gray-500 text-sm mb-4">
              Capture a live photo using your webcam.
            </p>

            <div className="w-64 h-64 bg-purple-100 rounded-xl overflow-hidden border flex items-center justify-center mb-4">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover rounded-xl ${
                  cameraActive ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>

            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Camera
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={capturePhoto}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Capture
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Stop
                </button>
              </div>
            )}
          </div>
        </div>

        {/* STATUS */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-700 text-sm">
          Ready to proceed with verification.
        </div>

        {preview && (
          <div className="mt-6 flex justify-center">
            <img
              src={preview}
              alt="preview"
              className="w-48 h-48 object-cover rounded-lg shadow-md border"
            />
          </div>
        )}

        {/* SUBMIT */}
        <div className="mt-8 flex justify-center">
          <button
            disabled={!imageBase64 || submitting}
            onClick={submitVerification}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" /> Submitting...
              </div>
            ) : (
              "Submit Verification"
            )}
          </button>
        </div>

        {statusMessage && (
          <p className="mt-4 text-center text-md font-semibold text-gray-700">
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default FaceVerificationPage;

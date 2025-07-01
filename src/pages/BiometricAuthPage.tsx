// src/pages/BiometricAuthPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { verifyFaceSignature, getFaceRegistrationStatus } from "@/lib/faceSignatureService";
import { toast } from "sonner";

const BiometricAuthPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [faceRegistered, setFaceRegistered] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and has registered face
    const checkUserAndFace = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        toast.error("Please log in first");
        navigate("/auth");
        return;
      }
      setUser(user);

      // Check face registration status
      const { isRegistered } = await getFaceRegistrationStatus();
      setFaceRegistered(isRegistered);
      
      if (!isRegistered) {
        toast.info("Please register your face first");
        navigate("/biometric-register");
      }
    };

    checkUserAndFace();
  }, [navigate]);

  const handleFaceAuth = async () => {
    if (!user || !faceRegistered) {
      toast.error("Face not registered. Please register first.");
      navigate("/biometric-register");
      return;
    }

    setIsLoading(true);
    try {
      const faceio = new faceIO("fioad3e0");

      const userInfo = await faceio.authenticate({
        locale: "auto"
      });

      console.log("✅ FaceIO authentication successful:", userInfo);

      // Verify face signature in database
      const isVerified = await verifyFaceSignature(userInfo.facialId);
      
      if (!isVerified) {
        toast.error("Face signature verification failed. Please try again or re-register.");
        return;
      }

      toast.success(`Authenticated successfully: ${userInfo.details.email || user.email}`);
      
      // Navigate to elections page
      navigate("/elections");

    } catch (err: any) {
      console.error("❌ Face authentication error:", err);
      
      let errorMessage = "Authentication failed";
      if (typeof err === "number") {
        errorMessage = `Authentication failed. Error code: ${err}`;
      } else if (err?.code) {
        errorMessage = `Authentication failed. Error code: ${err.code}`;
      } else if (err?.message) {
        errorMessage = `Authentication failed: ${err.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 text-white">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        <p className="mb-6">Checking authentication status...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 text-white">
      <h1 className="text-3xl font-bold mb-4">Verify Your Face</h1>
      <p className="mb-6">Authenticate your biometric signature before casting your vote.</p>
      <p className="mb-6 text-sm text-blue-200">
        Your face will be verified against your registered signature in our secure database.
      </p>
      <button
        onClick={handleFaceAuth}
        disabled={isLoading || !faceRegistered}
        className="px-6 py-3 bg-white text-blue-900 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Verifying..." : "Verify Face"}
      </button>
      {!faceRegistered && (
        <p className="mt-4 text-sm text-yellow-200">
          Face not registered. You will be redirected to registration.
        </p>
      )}
      {isLoading && (
        <p className="mt-4 text-sm text-blue-200">
          Please look directly at your camera for face verification...
        </p>
      )}
    </div>
  );
};

export default BiometricAuthPage;

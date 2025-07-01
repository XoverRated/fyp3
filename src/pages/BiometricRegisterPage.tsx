

// src/pages/BiometricRegisterPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { storeFaceSignature, getFaceRegistrationStatus } from "@/lib/faceSignatureService";
import { toast } from "sonner";

const BiometricRegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated and get user data
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        toast.error("Please log in first");
        navigate("/auth");
        return;
      }
      setUser(user);

      // Check if face is already registered
      const { isRegistered } = await getFaceRegistrationStatus();
      if (isRegistered) {
        toast.info("Face already registered");
        navigate("/biometric-auth");
      }
    };

    getUser();
  }, [navigate]);

  const handleFaceRegistration = async () => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setIsLoading(true);
    try {
      const faceio = new faceIO("fioad3e0"); // Replace with your real FACEIO public ID

      const userInfo = await faceio.enroll({
        locale: "auto",
        payload: {
          email: user.email || "voter@example.com",
          voterId: user.id,
          userId: user.id
        }
      });

      console.log("✅ FaceIO registration successful:", userInfo);

      // Store face signature in database
      await storeFaceSignature({
        faceioFaceId: userInfo.facialId,
        userInfo: userInfo
      });

      toast.success("Face registered successfully!");
      
      // Set local storage for backward compatibility
      localStorage.setItem("faceRegistered", "true");
      
      // Navigate to verification page
      navigate("/biometric-auth");

    } catch (err: any) {
      console.error("❌ Face registration error:", err);
      
      let errorMessage = "Registration failed";
      if (typeof err === "number") {
        errorMessage = `Registration failed. Error code: ${err}`;
      } else if (err?.code) {
        errorMessage = `Registration failed. Error code: ${err.code}`;
      } else if (err?.message) {
        errorMessage = `Registration failed: ${err.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 text-white">
      <h1 className="text-3xl font-bold mb-4">Register Your Face</h1>
      <p className="mb-6">Securely register your biometric signature before voting.</p>
      <p className="mb-6 text-sm text-blue-200">
        Your face signature will be encrypted and stored securely in our database.
      </p>
      <button
        onClick={handleFaceRegistration}
        disabled={isLoading || !user}
        className="px-6 py-3 bg-white text-blue-900 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Registering..." : "Register Face"}
      </button>
      {isLoading && (
        <p className="mt-4 text-sm text-blue-200">
          Please look directly at your camera for face registration...
        </p>
      )}
    </div>
  );
};

export default BiometricRegisterPage;

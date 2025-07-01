import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FingerprintIcon, Loader2Icon, ShieldCheckIcon, AlertCircleIcon, ExternalLinkIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Helper functions (can be moved to utils later)
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

const FingerprintDisplay = ({ isScanning }: { isScanning: boolean }) => {
  // Re-using the FingerprintDisplay from BiometricAuth.tsx for visual consistency
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${isScanning ? "animate-pulse text-vote-accent" : "text-gray-400"}`}
    >
      <path d="M50 10C40.6064 10 31.7838 14.2143 25.2513 22.015C24.5403 22.6937 23.4597 22.6937 22.7487 22.015C22.0378 21.3362 22.0378 20.3021 22.7487 19.6233C29.9298 11.1224 39.5301 6.66667 50 6.66667C60.4699 6.66667 70.0702 11.1224 77.2513 19.6233C77.9622 20.3021 77.9622 21.3362 77.2513 22.015C76.5403 22.6937 75.4597 22.6937 74.7487 22.015C68.2162 14.2143 59.3936 10 50 10Z" fill="currentColor"/>
      <path d="M77.2513 29.2872C76.5403 28.6085 75.4597 28.6085 74.7487 29.2872C68.2162 37.088 59.3936 41.3333 50 41.3333C40.6064 41.3333 31.7838 37.088 25.2513 29.2872C24.5403 28.6085 23.4597 28.6085 22.7487 29.2872C22.0378 29.966 22.0378 31.0001 22.7487 31.6789C29.9298 40.1798 39.5301 44.6667 50 44.6667C60.4699 44.6667 70.0702 40.1798 77.2513 31.6789C77.9622 31.0001 77.9622 29.966 77.2513 29.2872Z" fill="currentColor"/>
      <path d="M77.2513 36.6233C76.5403 35.9445 75.4597 35.9445 74.7487 36.6233C68.2162 44.4241 59.3936 48.6667 50 48.6667C40.6064 48.6667 31.7838 44.4241 25.2513 36.6233C24.5403 35.9445 23.4597 35.9445 22.7487 36.6233C22.0378 37.3021 22.0378 38.3362 22.7487 39.015C29.9298 47.5159 39.5301 52 50 52C60.4699 52 70.0702 47.5159 77.2513 39.015C77.9622 38.3362 77.9622 37.3021 77.2513 36.6233Z" fill="currentColor"/>
      <path d="M77.2513 44.2872C76.5403 43.6085 75.4597 43.6085 74.7487 44.2872C68.2162 52.088 59.3936 56.3333 50 56.3333C40.6064 56.3333 31.7838 52.088 25.2513 44.2872C24.5403 43.6085 23.4597 43.6085 22.7487 44.2872C22.0378 44.966 22.0378 46.0001 22.7487 46.6789C29.9298 55.1798 39.5301 59.6667 50 59.6667C60.4699 59.6667 70.0702 55.1798 77.2513 46.6789C77.9622 46.0001 77.9622 44.966 77.2513 44.2872Z" fill="currentColor"/>
      <path d="M77.2513 51.6233C76.5403 50.9445 75.4597 50.9445 74.7487 51.6233C68.2162 59.4241 59.3936 63.6667 50 63.6667C40.6064 63.6667 31.7838 59.4241 25.2513 51.6233C24.5403 50.9445 23.4597 50.9445 22.7487 51.6233C22.0378 52.3021 22.0378 53.3362 22.7487 54.015C29.9298 62.5159 39.5301 67 50 67C60.4699 67 70.0702 62.5159 77.2513 54.015C77.9622 53.3362 77.9622 52.3021 77.2513 51.6233Z" fill="currentColor"/>
      <path d="M77.2513 59.2872C76.5403 58.6085 75.4597 58.6085 74.7487 59.2872C68.2162 67.088 59.3936 71.3333 50 71.3333C40.6064 71.3333 31.7838 67.088 25.2513 59.2872C24.5403 58.6085 23.4597 58.6085 22.7487 59.2872C22.0378 59.966 22.0378 61.0001 22.7487 61.6789C29.9298 70.1798 39.5301 74.6667 50 74.6667C60.4699 74.6667 70.0702 70.1798 77.2513 61.6789C77.9622 61.0001 77.9622 59.966 77.2513 59.2872Z" fill="currentColor"/>
      <path d="M74.7487 66.6233C68.2162 74.4241 59.3936 78.6667 50 78.6667C40.6064 78.6667 31.7838 74.4241 25.2513 66.6233C24.5403 65.9445 23.4597 65.9445 22.7487 66.6233C22.0378 67.3021 22.0378 68.3362 22.7487 69.015C29.9298 77.5159 39.5301 82 50 82C60.4699 82 70.0702 77.5159 77.2513 69.015C77.9622 68.3362 77.9622 67.3021 77.2513 66.6233C76.5403 65.9445 75.4597 65.9445 74.7487 66.6233Z" fill="currentColor"/>
      <path d="M74.7487 74.2872C68.2162 82.088 59.3936 86.3333 50 86.3333C40.6064 86.3333 31.7838 82.088 25.2513 74.2872C24.5403 73.6085 23.4597 73.6085 22.7487 74.2872C22.0378 74.966 22.0378 76.0001 22.7487 76.6789C29.9298 85.1798 39.5301 89.6667 50 89.6667C60.4699 89.6667 70.0702 85.1798 77.2513 76.6789C77.9622 76.0001 77.9622 74.966 77.2513 74.2872C76.5403 73.6085 75.4597 73.6085 74.7487 74.2872Z" fill="currentColor"/>
    </svg>
  );
};


export const BiometricRegister = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [biometricsAvailable, setBiometricsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isIframeContext, setIsIframeContext] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      toast({ title: "User not found", description: "Please sign up again.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    
    // Check if running in iframe context
    setIsIframeContext(window !== window.top);
    checkBiometricSupport();
  }, [user, navigate, toast]);

  const checkBiometricSupport = async () => {
    try {
      if (!window.PublicKeyCredential) {
        setBiometricsAvailable(false);
        setError("WebAuthn (Biometrics) is not supported by this browser.");
        return;
      }
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setBiometricsAvailable(available);
      if (!available) {
        setError("Your device doesn't appear to support biometric registration or it's not enabled.");
      }
    } catch (err) {
      console.error("Error checking biometric support:", err);
      setBiometricsAvailable(false);
      setError("Could not determine if biometrics are supported on this device.");
    }
  };

  const handleRegisterBiometric = async () => {
    if (!user) {
      setError("User session not found. Cannot register biometrics.");
      return;
    }
    if (!biometricsAvailable) {
      setError("Biometric registration is not available on this device/browser.");
      return;
    }

    setIsScanning(true);
    setProgress(0);
    setError(null);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 60 ? prev + 10 : 60));
    }, 200);

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const creationOptions: PublicKeyCredentialCreationOptions = {
        rp: {
          name: "VoteChain App",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(user.id),
          name: user.email || "user@example.com",
          displayName: user.user_metadata?.full_name || user.email || "User",
        },
        challenge,
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60000,
        attestation: "direct",
      };

      const credential = await navigator.credentials.create({ publicKey: creationOptions }) as PublicKeyCredential | null;
      clearInterval(interval);

      if (credential && credential.rawId) {
        setProgress(100);
        const credentialIdBase64 = bufferToBase64(credential.rawId);

        const { error: updateError } = await supabase.auth.updateUser({
          data: { biometric_credential_id: credentialIdBase64 }
        });

        if (updateError) {
          throw new Error(`Failed to save biometric reference: ${updateError.message}`);
        }
        
        toast({
          title: "Biometric Registration Successful",
          description: "Your biometric credential has been registered.",
        });
        
        setTimeout(() => {
          setIsScanning(false);
          navigate("/elections");
        }, 500);

      } else {
        throw new Error("Biometric registration failed or was cancelled.");
      }
    } catch (err) {
      clearInterval(interval);
      console.error("Biometric registration error:", err);
      setIsScanning(false);
      setProgress(0);
      
      let errorMessage = "An unknown error occurred during registration.";
      
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          if (err.message.includes("publickey-credentials-create") || err.message.includes("Permissions Policy")) {
            errorMessage = "Biometric registration is not available in this context. Please try opening the app in a new browser tab or window.";
            setIsIframeContext(true);
          } else {
            errorMessage = "Biometric registration was denied or cancelled. Please ensure your device supports biometrics and try again.";
          }
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      toast({
        title: "Biometric Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const handleSkipRegistration = () => {
    toast({
      title: "Biometrics Skipped",
      description: "Proceeding without biometric registration. You can register later from settings.",
      variant: "default",
    });
    navigate("/elections");
  };

  const handleOpenInNewTab = () => {
    const currentUrl = window.location.href;
    window.open(currentUrl, '_blank');
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-full bg-vote-light mb-4">
          <FingerprintIcon className="h-10 w-10 text-vote-teal" />
        </div>
        <h2 className="text-2xl font-bold text-vote-blue">Register Biometrics</h2>
        <p className="text-gray-600 mt-2">
          Set up fingerprint or face recognition for secure access.
        </p>
      </div>

      {isIframeContext && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-700">Browser Restrictions Detected</h3>
              <p className="text-sm text-blue-600 mt-1 mb-3">
                Biometric registration may not work properly in this context. For best results, open the app in a new browser tab.
              </p>
              <Button
                onClick={handleOpenInNewTab}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </div>
      )}

      {biometricsAvailable === false && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircleIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-700">Biometrics Not Available</h3>
              <p className="text-sm text-yellow-600 mt-1">
                Your device or browser may not support biometric registration, or it's not enabled.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-700">Registration Error</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex justify-center">
        <div 
          className={`relative w-48 h-48 bg-vote-gray rounded-lg flex items-center justify-center ${
            isScanning ? "biometric-scan" : ""
          }`}
          style={{border: '1px solid #e5e7eb'}}
        >
          <FingerprintDisplay isScanning={isScanning} />
          
          {isScanning && (
            <div className="absolute bottom-4 left-0 right-0 px-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-vote-accent h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={handleRegisterBiometric}
        disabled={isScanning || biometricsAvailable === false || !user}
        className="w-full bg-vote-teal hover:bg-vote-blue transition-colors"
      >
        {isScanning ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Registering...
          </>
        ) : (
          "Register Fingerprint"
        )}
      </Button>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Prefer not to use biometrics now? <button 
            className="text-vote-teal hover:underline" 
            onClick={handleSkipRegistration}
          >
            Skip for now
          </button>
        </p>
      </div>
    </div>
  );
};

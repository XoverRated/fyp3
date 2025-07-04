
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import BiometricRegisterPage from "@/pages/BiometricRegisterPage";
import BiometricAuthPage from "@/pages/BiometricAuthPage";

import AuthPage from "@/pages/AuthPage";
import ElectionsPage from "@/pages/ElectionsPage";
import ElectionDetailPage from "@/pages/ElectionDetailPage";
import VoteConfirmationPage from "@/pages/VoteConfirmationPage";
import VerifyPage from "@/pages/VerifyPage";
import HowItWorksPage from "@/pages/HowItWorksPage";
import FAQPage from "@/pages/FAQPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import SecurityInfoPage from "@/pages/SecurityInfoPage";
import ContactPage from "@/pages/ContactPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import AboutUsPage from "@/pages/AboutUsPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage"; // New
import NotFound from "@/pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"; // Assuming you have this
import { AdminRoute } from "@/components/auth/AdminRoute"; // New


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          
          
          <Route path="/biometric-register" element={<ProtectedRoute><BiometricRegisterPage /></ProtectedRoute>} />
          <Route path="/biometric-auth" element={<ProtectedRoute><BiometricAuthPage/></ProtectedRoute> } />
          <Route path="/elections" element={<ProtectedRoute><ElectionsPage /></ProtectedRoute>} />
          <Route path="/elections/:id" element={<ProtectedRoute><ElectionDetailPage /></ProtectedRoute>} />
          <Route path="/vote-confirmation" element={<ProtectedRoute><VoteConfirmationPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Admin Route */}
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/security" element={<SecurityInfoPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

export default App;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Features from "../components/Features";
import AuthModal from "../components/AuthModal";
import { supabase } from "../config/supabaseClient";

export default function LandingPage({ user }: { user: any }) {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { t } = useTranslation();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="block text-gray-900">{t("landing.title")}</span>
            <span className="block text-blue-600 mt-1">
              {t("landing.subtitle")}
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600">
            {t("landing.description")}
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {user ? t("landing.dashboard") : t("landing.getStarted")}
            </button>
            {user && (
              <button
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {t("nav.logout")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Features />
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

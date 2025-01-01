import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../config/supabaseClient";
import AuthModal from "./AuthModal";

interface NavbarProps {
  user: any;
}

export default function Navbar({ user }: NavbarProps) {
  const { t, i18n } = useTranslation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "de" ? "en" : "de");
  };

  return (
    <>
      {/* Top Navbar für Desktop */}
      <nav className="bg-white shadow hidden sm:block">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="flex items-center text-xl font-bold text-gray-800 hover:text-blue-600"
              >
                Feedbacker
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-blue-600"
              >
                {t("nav.boards")}
              </Link>
              {user ? (
                <>
                  <Link
                    to="/settings"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    {t("nav.settings")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {t("nav.login")}
                </button>
              )}
              <button
                onClick={toggleLanguage}
                className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
              >
                {i18n.language === "de" ? "🇬🇧 EN" : "🇩🇪 DE"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation für Mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center h-16">
          <Link
            to="/"
            className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-blue-600 active:bg-gray-100"
          >
            <span className="text-2xl mb-1">💬</span>
            <span className="text-xs">{t("nav.home")}</span>
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-blue-600 active:bg-gray-100"
              >
                <span className="text-2xl mb-1">📋</span>
                <span className="text-xs">{t("nav.boards")}</span>
              </Link>
              <Link
                to="/settings"
                className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-blue-600 active:bg-gray-100"
              >
                <span className="text-2xl mb-1">⚙️</span>
                <span className="text-xs">{t("nav.settings")}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-red-600 active:bg-gray-100"
              >
                <span className="text-2xl mb-1">🚪</span>
                <span className="text-xs">{t("nav.logout")}</span>
              </button>
            </>
          ) : (
            <Link
              to="/"
              className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-blue-600 active:bg-gray-100"
            >
              <span className="text-2xl mb-1">🔑</span>
              <span className="text-xs">{t("nav.login")}</span>
            </Link>
          )}
          {/* Mobile Sprach-Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex flex-col items-center justify-center w-full h-full text-gray-600 active:bg-gray-100"
          >
            <span className="text-2xl mb-1">🌐</span>
            <span className="text-xs">
              {(i18n.language || "en").toUpperCase()}
            </span>
          </button>
        </div>
      </nav>

      {/* Spacer für Mobile Navigation */}
      <div className="h-16 sm:hidden" />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

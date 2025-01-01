import { Link } from "react-router-dom";
import { supabase } from "../config/supabaseClient";

interface NavbarProps {
  user: any;
}

export default function Navbar({ user }: NavbarProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
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
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/settings"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Einstellungen
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Login
                </Link>
              )}
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
            <span className="text-xs">Home</span>
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-blue-600 active:bg-gray-100"
              >
                <span className="text-2xl mb-1">📋</span>
                <span className="text-xs">Boards</span>
              </Link>
              <Link
                to="/settings"
                className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-blue-600 active:bg-gray-100"
              >
                <span className="text-2xl mb-1">⚙️</span>
                <span className="text-xs">Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-red-600 active:bg-gray-100"
              >
                <span className="text-2xl mb-1">🚪</span>
                <span className="text-xs">Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/"
              className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-blue-600 active:bg-gray-100"
            >
              <span className="text-2xl mb-1">🔑</span>
              <span className="text-xs">Login</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Spacer für Mobile Navigation */}
      <div className="h-16 sm:hidden" />
    </>
  );
}

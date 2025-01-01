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
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className="flex items-center text-xl font-bold text-gray-800 hover:text-blue-600"
            >
              Feedbacker
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Dashboard
                </Link>
                <span className="text-gray-600">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
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
  );
}

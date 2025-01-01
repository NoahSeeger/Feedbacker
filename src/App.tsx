import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { supabase } from "./config/supabaseClient";
import { User } from "@supabase/supabase-js";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import FeedbackBoard from "./pages/FeedbackBoard";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<LandingPage user={user} />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/board/:boardId"
            element={<FeedbackBoard user={user} />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

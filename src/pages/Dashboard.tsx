import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../config/supabaseClient";
import { toast } from "react-hot-toast";
import { containsInappropriateContent } from "../utils/contentChecker";
import AuthModal from "../components/AuthModal";

interface FeedbackBoard {
  id: string;
  title: string;
  description: string;
  user_id: string;
  created_at: string;
}

export default function Dashboard({ user }: { user: any }) {
  const { t } = useTranslation();
  const [boards, setBoards] = useState<FeedbackBoard[]>([]);
  const [newBoard, setNewBoard] = useState({ title: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  async function fetchBoards() {
    const { data, error } = await supabase
      .from("feedback_boards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error:", error);
    else setBoards(data || []);
  }

  async function createBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error(t("auth.loginRequired"));
      return;
    }

    setError("");

    if (
      containsInappropriateContent(newBoard.title) ||
      containsInappropriateContent(newBoard.description)
    ) {
      setError(t("common.inappropriateContent"));
      return;
    }

    if (!newBoard.title.trim()) return;

    const { error } = await supabase.from("feedback_boards").insert([
      {
        title: newBoard.title,
        description: newBoard.description,
        user_id: user.id,
      },
    ]);

    if (error) console.error("Error:", error);
    else {
      setNewBoard({ title: "", description: "" });
      setIsCreating(false);
      fetchBoards();
    }
  }

  // Trennen der Boards in eigene und andere
  const ownBoards = user
    ? boards.filter((board) => board.user_id === user.id)
    : [];
  const otherBoards = user
    ? boards.filter((board) => board.user_id !== user.id)
    : boards;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
        {user ? (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            {t("dashboard.createBoard")}
          </button>
        ) : (
          <div className="flex items-center gap-2 text-gray-600 bg-blue-50 px-4 py-2 rounded-md">
            <span>{t("dashboard.loginToCreate")}</span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {t("nav.login")}
            </button>
          </div>
        )}
      </div>

      {/* Create Board Modal - nur für eingeloggte User */}
      {isCreating && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {t("dashboard.newBoard.title")}
            </h2>
            <form onSubmit={createBoard}>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              <input
                type="text"
                placeholder={t("dashboard.newBoard.nameLabel")}
                value={newBoard.title}
                onChange={(e) =>
                  setNewBoard({ ...newBoard, title: e.target.value })
                }
                className="w-full p-2 border rounded mb-4"
              />
              <textarea
                placeholder={t("dashboard.newBoard.descriptionLabel")}
                value={newBoard.description}
                onChange={(e) =>
                  setNewBoard({ ...newBoard, description: e.target.value })
                }
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {t("dashboard.newBoard.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Eigene Boards Sektion - nur für eingeloggte User */}
      {user && ownBoards.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{t("dashboard.myBoards")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {ownBoards.map((board) => (
              <Link
                key={board.id}
                to={`/board/${board.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{board.title}</h3>
                  <p className="text-gray-600">{board.description}</p>
                  <div className="mt-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {t("dashboard.owner")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Alle Boards Sektion */}
      <div>
        <h2 className="text-2xl font-bold mb-6">{t("dashboard.allBoards")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {otherBoards.map((board) => (
            <Link
              key={board.id}
              to={`/board/${board.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{board.title}</h3>
                <p className="text-gray-600">{board.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { supabase } from "../config/supabaseClient";
import DeleteBoardModal from "../components/DeleteBoardModal";
import FeedbackItem from "../components/FeedbackItem";
import { v4 as uuidv4 } from "uuid";

interface FeedbackItem {
  id: string;
  content: string;
  board_id: string;
  created_at: string;
}

interface BoardDetails {
  id: string;
  title: string;
  description: string;
  user_id: string;
}

export default function FeedbackBoard({ user }: { user: any }) {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [newFeedback, setNewFeedback] = useState("");
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lastFeedbackTime, setLastFeedbackTime] = useState<number>(0);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const FEEDBACK_COOLDOWN = 30000;

  const [sessionId] = useState(() => {
    const existing = localStorage.getItem("feedback_session_id");
    if (existing) return existing;

    const newId = uuidv4();
    localStorage.setItem("feedback_session_id", newId);
    return newId;
  });

  useEffect(() => {
    if (!boardId) {
      navigate("/dashboard");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const { data: boardData, error: boardError } = await supabase
          .from("feedback_boards")
          .select("*")
          .eq("id", boardId)
          .single();

        if (boardError) throw boardError;
        if (!boardData) {
          toast.error("Board nicht gefunden");
          navigate("/dashboard");
          return;
        }

        setBoardDetails(boardData);
        setIsOwner(user?.id === boardData.user_id);

        const { data: feedbackData, error: feedbackError } = await supabase
          .from("feedback_items")
          .select("*")
          .eq("board_id", boardId)
          .order("created_at", { ascending: false });

        if (feedbackError) throw feedbackError;

        setFeedbackItems(feedbackData || []);
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Fehler beim Laden der Daten");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [boardId, user?.id, navigate]);

  useEffect(() => {
    const initialRemaining = Math.max(
      0,
      FEEDBACK_COOLDOWN - (Date.now() - lastFeedbackTime)
    );
    setTimeRemaining(Math.ceil(initialRemaining / 1000));

    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        FEEDBACK_COOLDOWN - (Date.now() - lastFeedbackTime)
      );
      setTimeRemaining(Math.ceil(remaining / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [lastFeedbackTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmitFeedback()) {
      toast.error(`Bitte warten Sie noch ${timeRemaining} Sekunden`);
      return;
    }

    const cleanContent = newFeedback.trim();
    if (!cleanContent) {
      toast.error("Bitte geben Sie Feedback ein");
      return;
    }

    try {
      const { data, error: insertError } = await supabase
        .from("feedback_items")
        .insert([
          {
            content: cleanContent,
            board_id: boardId,
            created_at: new Date().toISOString(),
            user_id: user?.id || null,
            session_id: user?.id ? null : sessionId,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      setFeedbackItems([data, ...feedbackItems]);
      setNewFeedback("");
      setLastFeedbackTime(Date.now());
      toast.success("Feedback wurde hinzugefügt");
    } catch (err) {
      console.error("Error adding feedback:", err);
      toast.error("Fehler beim Hinzufügen des Feedbacks");
    }
  };

  const handleDeleteBoard = async () => {
    try {
      // Erst Votes löschen
      const { data: feedbackItems } = await supabase
        .from("feedback_items")
        .select("id")
        .eq("board_id", boardId);

      if (feedbackItems && feedbackItems.length > 0) {
        const { error: votesError } = await supabase
          .from("feedback_votes")
          .delete()
          .in(
            "feedback_id",
            feedbackItems.map((item) => item.id)
          );

        if (votesError) throw votesError;
      }

      // Dann Feedback-Items löschen
      const { error: itemsError } = await supabase
        .from("feedback_items")
        .delete()
        .eq("board_id", boardId);

      if (itemsError) throw itemsError;

      // Zuletzt Board löschen
      const { error: boardError } = await supabase
        .from("feedback_boards")
        .delete()
        .eq("id", boardId);

      if (boardError) throw boardError;

      navigate("/dashboard");
      toast.success("Board wurde erfolgreich gelöscht");
    } catch (err) {
      console.error("Error deleting board:", err);
      toast.error("Fehler beim Löschen des Boards");
    }
  };

  const canSubmitFeedback = () => {
    return timeRemaining === 0;
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link wurde in die Zwischenablage kopiert");
    } catch (err) {
      toast.error("Fehler beim Kopieren des Links");
    }
  };

  const handleUpdateBoard = async () => {
    if (!boardId || !isOwner) return;

    try {
      const { error } = await supabase
        .from("feedback_boards")
        .update({
          title: editTitle,
          description: editDescription,
        })
        .eq("id", boardId);

      if (error) throw error;

      setBoardDetails((prev) =>
        prev
          ? {
              ...prev,
              title: editTitle,
              description: editDescription,
            }
          : null
      );
      setIsEditing(false);
      toast.success("Board wurde aktualisiert");
    } catch (err) {
      console.error("Error updating board:", err);
      toast.error("Fehler beim Aktualisieren des Boards");
    }
  };

  const startEditing = () => {
    if (boardDetails) {
      setEditTitle(boardDetails.title);
      setEditDescription(boardDetails.description);
      setIsEditing(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!boardDetails) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">
          Board nicht gefunden
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        {boardDetails && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 text-lg font-semibold border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Board Titel"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Board Beschreibung"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateBoard}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {boardDetails.title}
                </h1>
                <p className="text-gray-600 mb-4">{boardDetails.description}</p>
                <div className="flex flex-wrap gap-2">
                  {isOwner && (
                    <>
                      <button
                        onClick={startEditing}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <span className="mr-2">✏️</span>
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        <span className="mr-2">🗑️</span>
                        Löschen
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <span className="mr-2">📤</span>
                    Teilen
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback Input Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="feedback"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Dein Feedback
              </label>
              <textarea
                id="feedback"
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Was denkst du?"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!canSubmitFeedback()}
                className={`px-6 py-2 rounded-md text-white transition-colors ${
                  canSubmitFeedback()
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Feedback senden
              </button>
            </div>
            {!canSubmitFeedback() && (
              <p className="text-sm text-gray-500 text-right">
                Bitte warten Sie noch {timeRemaining} Sekunden
              </p>
            )}
          </form>
        </div>

        {/* Feedback List Section */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : feedbackItems.length > 0 ? (
            feedbackItems.map((item) => (
              <FeedbackItem
                key={item.id}
                feedback={item}
                userId={user?.id}
                sessionId={sessionId}
                isOwner={isOwner || (user?.id && item.user_id === user.id)}
                onDelete={() => {
                  setFeedbackItems((items) =>
                    items.filter((i) => i.id !== item.id)
                  );
                }}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Noch keine Feedback-Einträge vorhanden.
              </p>
            </div>
          )}
        </div>
      </div>

      <DeleteBoardModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteBoard}
        boardName={boardDetails?.title || ""}
      />
    </div>
  );
}

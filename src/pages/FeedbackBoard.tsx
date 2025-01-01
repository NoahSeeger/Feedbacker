import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { supabase } from "../config/supabaseClient";
import DeleteBoardModal from "../components/DeleteBoardModal";
import FeedbackItem from "../components/FeedbackItem";
import { containsInappropriateContent } from "../utils/contentChecker";
// import { deleteFeedback } from "../services/feedbackService";

interface FeedbackItem {
  id: string;
  content: string;
  board_id: string;
  created_at: string;
  user_id?: string;
  session_id?: string;
  upvotes: number;
  downvotes: number;
}

interface BoardDetails {
  id: string;
  title: string;
  description: string;
  user_id: string;
}

type SortOption = "newest" | "oldest" | "mostVoted" | "leastVoted";

export default function FeedbackBoard({ user }: { user: any }) {
  const { t } = useTranslation();
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
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const FEEDBACK_COOLDOWN = 30;

  const [sessionId] = useState(() => {
    let existingId = localStorage.getItem("feedback_session_id");
    if (!existingId) {
      existingId = crypto.randomUUID();
      localStorage.setItem("feedback_session_id", existingId);
    }
    return existingId;
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
          toast.error(t("feedbackBoard.notFound"));
          navigate("/dashboard");
          return;
        }

        setBoardDetails(boardData);
        setIsOwner(user?.id === boardData.user_id);

        // Hole zuerst die Feedback-Items
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("feedback_items")
          .select("*")
          .eq("board_id", boardId)
          .order("created_at", { ascending: false });

        if (feedbackError) throw feedbackError;

        // Hole dann die Vote-Counts für jedes Feedback-Item
        const feedbackWithVotes = await Promise.all(
          (feedbackData || []).map(async (feedback) => {
            const { count: upvotes } = await supabase
              .from("feedback_votes")
              .select("*", { count: "exact", head: true })
              .eq("feedback_id", feedback.id)
              .eq("vote_type", "up");

            const { count: downvotes } = await supabase
              .from("feedback_votes")
              .select("*", { count: "exact", head: true })
              .eq("feedback_id", feedback.id)
              .eq("vote_type", "down");

            return {
              ...feedback,
              upvotes: upvotes || 0,
              downvotes: downvotes || 0,
            };
          })
        );

        setFeedbackItems(feedbackWithVotes);
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error(t("feedbackBoard.loadError"));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [boardId, user?.id, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const timeSinceLastFeedback = Math.floor((now - lastFeedbackTime) / 1000);
      const remaining = Math.max(0, FEEDBACK_COOLDOWN - timeSinceLastFeedback);
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [lastFeedbackTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitFeedback()) return;

    const cleanContent = newFeedback.trim();
    if (!cleanContent) {
      toast.error(t("feedback.emptyError"));
      return;
    }

    if (containsInappropriateContent(cleanContent)) {
      toast.error(t("feedback.inappropriateContent"));
      return;
    }

    try {
      const { data, error } = await supabase
        .from("feedback_items")
        .insert([
          {
            content: newFeedback,
            board_id: boardId,
            user_id: user?.id || null,
            session_id: user?.id ? null : sessionId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setFeedbackItems([data, ...feedbackItems]);
      setNewFeedback("");
      setLastFeedbackTime(Date.now());
      toast.success(t("toast.feedback.created"));
    } catch (error) {
      console.error("Error adding feedback:", error);
      toast.error(t("toast.feedback.createError"));
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
      toast.success(t("toast.board.deleted"));
    } catch (err) {
      console.error("Error deleting board:", err);
      toast.error(t("toast.board.deleteError"));
    }
  };

  const canSubmitFeedback = () => {
    const now = Date.now();
    const timeSinceLastFeedback = Math.floor((now - lastFeedbackTime) / 1000);
    return timeSinceLastFeedback >= FEEDBACK_COOLDOWN;
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("toast.board.linkCopied"));
    } catch (err) {
      toast.error(t("toast.board.copyError"));
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
      toast.success(t("toast.board.updated"));
    } catch (err) {
      console.error("Error updating board:", err);
      toast.error(t("toast.board.updateError"));
    }
  };

  const startEditing = () => {
    if (boardDetails) {
      setEditTitle(boardDetails.title);
      setEditDescription(boardDetails.description);
      setIsEditing(true);
    }
  };

  const handleDelete = async (feedbackId: string) => {
    try {
      if (!feedbackId) return;

      // Lösche zuerst die Votes
      const { error: votesError } = await supabase
        .from("feedback_votes")
        .delete()
        .eq("feedback_id", feedbackId);

      if (votesError) {
        console.error("Error deleting votes:", votesError);
        throw votesError;
      }

      // Dann lösche das Feedback
      const { error: deleteError } = await supabase
        .from("feedback_items")
        .delete()
        .eq("id", feedbackId);

      if (deleteError) {
        console.error("Error deleting feedback:", deleteError);
        throw deleteError;
      }

      // UI Update
      setFeedbackItems((prevItems) =>
        prevItems.filter((item) => item.id !== feedbackId)
      );

      toast.success(t("toast.feedback.deleted"));
    } catch (error) {
      console.error("Full error object:", error);
      toast.error(t("toast.feedback.deleteError"));
    }
  };

  // Sortier-Funktion
  const sortFeedbackItems = (items: FeedbackItem[]) => {
    switch (sortBy) {
      case "oldest":
        return [...items].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "mostVoted":
        return [...items].sort(
          (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
        );
      case "leastVoted":
        return [...items].sort(
          (a, b) => a.upvotes - a.downvotes - (b.upvotes - b.downvotes)
        );
      case "newest":
      default:
        return [...items].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
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
          {t("feedbackBoard.notFound")}
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-3 sm:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-8">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 text-lg font-semibold border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("feedbackBoard.titlePlaceholder")}
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("feedbackBoard.descriptionPlaceholder")}
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateBoard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {t("common.save")}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {boardDetails.title}
              </h1>
              <p className="text-gray-600 mb-4">{boardDetails.description}</p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                {isOwner && (
                  <>
                    <button
                      onClick={startEditing}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <span className="mr-2">✏️</span>
                      {t("common.edit")}
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <span className="mr-2">🗑️</span>
                      {t("common.delete")}
                    </button>
                  </>
                )}
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <span className="mr-2">📤</span>
                  {t("feedbackBoard.share")}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="feedback"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("feedbackBoard.yourFeedback")}
              </label>
              <textarea
                id="feedback"
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder={t("feedbackBoard.placeholder")}
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
                {t("feedbackBoard.submit")}
              </button>
            </div>
            {!canSubmitFeedback() && (
              <p className="text-sm text-gray-500 text-right">
                {t("feedbackBoard.waitMessagePrefix")} {timeRemaining}{" "}
                {t("feedbackBoard.waitMessageSuffix")}
              </p>
            )}
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-end">
            <label className="text-sm text-gray-600 mr-2">
              {t("feedbackBoard.sort.label")}:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">{t("feedbackBoard.sort.newest")}</option>
              <option value="oldest">{t("feedbackBoard.sort.oldest")}</option>
              <option value="mostVoted">
                {t("feedbackBoard.sort.mostVoted")}
              </option>
              <option value="leastVoted">
                {t("feedbackBoard.sort.leastVoted")}
              </option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {feedbackItems.length > 0 ? (
            sortFeedbackItems(feedbackItems).map((item) => (
              <FeedbackItem
                key={item.id}
                feedback={item}
                userId={user?.id}
                sessionId={sessionId}
                isBoardOwner={isOwner}
                onDelete={() => handleDelete(item.id)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">{t("feedbackBoard.noFeedback")}</p>
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

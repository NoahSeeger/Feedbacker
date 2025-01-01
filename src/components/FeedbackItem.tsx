import { supabase } from "../config/supabaseClient";
import { containsInappropriateContent } from "../utils/contentChecker";
import { toast } from "react-hot-toast";
import VoteButtons from "./VoteButtons";

interface FeedbackItemProps {
  feedback: {
    id: string;
    content: string;
    created_at: string;
    user_id?: string;
  };
  userId?: string;
  sessionId: string;
  isOwner: boolean;
  onDelete?: () => void;
}

export default function FeedbackItem({
  feedback,
  userId,
  sessionId,
  isOwner,
  onDelete,
}: FeedbackItemProps) {
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("feedback_items")
        .delete()
        .eq("id", feedback.id);

      if (error) throw error;

      onDelete?.();
      toast.success("Feedback wurde gelöscht");
    } catch (err) {
      console.error("Error deleting feedback:", err);
      toast.error("Fehler beim Löschen des Feedbacks");
    }
  };

  const hasInappropriateContent = containsInappropriateContent(
    feedback.content
  );
  const displayContent = hasInappropriateContent
    ? feedback.content.replace(/[^\s]/g, "*")
    : feedback.content;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-800">{displayContent}</p>
        <div className="flex items-center space-x-4">
          <VoteButtons
            feedbackId={feedback.id}
            userId={userId}
            sessionId={sessionId}
          />
          {isOwner && (
            <button
              onClick={handleDelete}
              className="ml-4 text-red-600 hover:text-red-800"
              title="Feedback löschen"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

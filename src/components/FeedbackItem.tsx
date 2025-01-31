import { useState } from "react";
import VoteButtons from "./VoteButtons";
import { containsInappropriateContent } from "../utils/contentChecker";
// import { useTranslation } from "react-i18next";

interface FeedbackItemProps {
  feedback: {
    id: string;
    content: string;
    created_at: string;
    user_id?: string;
    session_id?: string;
  };
  userId?: string;
  sessionId: string;
  isBoardOwner: boolean;
  onDelete: (feedbackId: string) => void;
}

export default function FeedbackItem({
  feedback,
  userId,
  sessionId,
  isBoardOwner,
  onDelete,
}: FeedbackItemProps) {
  // const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete =
    isBoardOwner ||
    (userId && feedback.user_id === userId) ||
    (!userId && feedback.session_id === sessionId);

  const handleDelete = async () => {
    if (isDeleting || !canDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(feedback.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasInappropriateContent = containsInappropriateContent(
    feedback.content
  );
  const displayContent = hasInappropriateContent
    ? feedback.content.replace(/[^\s]/g, "*")
    : feedback.content.length > 280
    ? `${feedback.content.slice(0, 280)}...`
    : feedback.content;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
        <div className="flex-1">
          <p className="text-sm sm:text-base">{displayContent}</p>
          <span className="text-sm text-gray-500 mt-2 block">
            {new Date(feedback.created_at).toLocaleString()}
          </span>
        </div>
        <div className="flex flex-row sm:flex-col items-center gap-2">
          <VoteButtons
            feedbackId={feedback.id}
            userId={userId}
            sessionId={sessionId}
          />
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="ml-4 text-red-600 hover:text-red-800 disabled:opacity-50"
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

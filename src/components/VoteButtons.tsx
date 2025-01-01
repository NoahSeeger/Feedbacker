import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface VoteButtonsProps {
  feedbackId: string;
  userId?: string;
  sessionId: string;
}

export default function VoteButtons({
  feedbackId,
  userId,
  sessionId,
}: VoteButtonsProps) {
  const [voteCount, setVoteCount] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [currentVote, setCurrentVote] = useState<"up" | "down" | null>(null);
  const { t } = useTranslation();

  // Lade den aktuellen Vote-Status
  useEffect(() => {
    loadVoteStatus();
  }, [feedbackId, userId, sessionId]);

  const loadVoteStatus = async () => {
    try {
      // Lade den aktuellen Vote des Users
      const { data: vote } = await supabase
        .from("feedback_votes")
        .select("vote_type")
        .eq("feedback_id", feedbackId)
        .eq(userId ? "user_id" : "session_id", userId || sessionId)
        .maybeSingle();

      setCurrentVote(vote?.vote_type || null);

      // Lade die Vote-Summe
      const { data: votes } = await supabase
        .from("feedback_votes")
        .select("vote_type")
        .eq("feedback_id", feedbackId);

      if (votes) {
        const upvotes = votes.filter((v) => v.vote_type === "up").length;
        const downvotes = votes.filter((v) => v.vote_type === "down").length;
        setVoteCount(upvotes - downvotes);
      }
    } catch (error) {
      console.error("Error loading votes:", error);
    }
  };

  const handleVote = async (type: "up" | "down") => {
    if (isVoting) return;
    setIsVoting(true);

    try {
      if (!userId && !sessionId) {
        toast.error(t("toast.voting.loginRequired"));
        return;
      }

      if (currentVote === type) {
        // Entferne Vote
        await supabase
          .from("feedback_votes")
          .delete()
          .eq("feedback_id", feedbackId)
          .eq(userId ? "user_id" : "session_id", userId || sessionId);

        setCurrentVote(null);
        toast.success(t("toast.voting.removed"));
      } else {
        // Erstelle oder aktualisiere Vote
        const voteData = {
          feedback_id: feedbackId,
          user_id: userId || null,
          session_id: userId ? null : sessionId,
          vote_type: type,
        };

        if (currentVote) {
          // Update existierenden Vote
          await supabase
            .from("feedback_votes")
            .update({ vote_type: type })
            .eq("feedback_id", feedbackId)
            .eq(userId ? "user_id" : "session_id", userId || sessionId);
        } else {
          // Erstelle neuen Vote
          await supabase.from("feedback_votes").insert([voteData]);
        }

        setCurrentVote(type);
        toast.success(t("toast.voting.added"));
      }

      await loadVoteStatus();
    } catch (error) {
      console.error("Vote error:", error);
      toast.error(t("toast.voting.error"));
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => handleVote("up")}
        disabled={isVoting}
        className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
          currentVote === "up"
            ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
            : "hover:bg-gray-100"
        }`}
      >
        <span className="text-xl">👍</span>
      </button>
      <span
        className={`font-medium ${
          voteCount > 0
            ? "text-blue-600"
            : voteCount < 0
            ? "text-red-600"
            : "text-gray-600"
        }`}
      >
        {voteCount}
      </span>
      <button
        onClick={() => handleVote("down")}
        disabled={isVoting}
        className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
          currentVote === "down"
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "hover:bg-gray-100"
        }`}
      >
        <span className="text-xl">👎</span>
      </button>
    </div>
  );
}

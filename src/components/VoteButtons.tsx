import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";
import { toast } from "react-hot-toast";

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
  const [userVote, setUserVote] = useState<boolean | null>(null);

  useEffect(() => {
    loadVotes();
  }, [feedbackId, userId, sessionId]);

  const loadVotes = async () => {
    try {
      // Vereinfachte Abfrage
      const { data: votes, error } = await supabase
        .from("feedback_votes")
        .select("*")
        .eq("feedback_id", feedbackId)
        .or(userId ? `user_id.eq.${userId}` : `session_id.eq.${sessionId}`);

      console.log("Votes query result:", { votes, error }); // Debug-Log

      if (!error && votes && votes.length > 0) {
        setUserVote(votes[0].is_upvote);
      }

      // Lade die Gesamtzahl der Votes
      const [upvoteResponse, downvoteResponse] = await Promise.all([
        supabase
          .from("feedback_votes")
          .select("id", { count: "exact", head: true })
          .eq("feedback_id", feedbackId)
          .eq("is_upvote", true),
        supabase
          .from("feedback_votes")
          .select("id", { count: "exact", head: true })
          .eq("feedback_id", feedbackId)
          .eq("is_upvote", false),
      ]);

      const upvotes = upvoteResponse.count || 0;
      const downvotes = downvoteResponse.count || 0;
      setVoteCount(upvotes - downvotes);
    } catch (err) {
      console.error("Error loading votes:", err);
    }
  };

  const handleVote = async (isUpvote: boolean) => {
    if (isVoting) return;
    setIsVoting(true);

    try {
      if (userVote !== null) {
        // Lösche existierenden Vote
        const { error: deleteError } = await supabase
          .from("feedback_votes")
          .delete()
          .eq("feedback_id", feedbackId)
          .or(userId ? `user_id.eq.${userId}` : `session_id.eq.${sessionId}`);

        if (deleteError) {
          console.error("Delete error:", deleteError); // Debug-Log
          throw deleteError;
        }

        setVoteCount((prev) => (userVote ? prev - 1 : prev + 1));
        setUserVote(null);
      } else {
        // Erstelle neuen Vote
        const voteData = {
          feedback_id: feedbackId,
          is_upvote: isUpvote,
          user_id: userId || null,
          session_id: userId ? null : sessionId,
        };

        console.log("Inserting vote:", voteData); // Debug-Log

        const { error: insertError } = await supabase
          .from("feedback_votes")
          .insert([voteData]);

        if (insertError) {
          console.error("Insert error:", insertError); // Debug-Log
          throw insertError;
        }

        setVoteCount((prev) => (isUpvote ? prev + 1 : prev - 1));
        setUserVote(isUpvote);
      }

      toast.success(userVote !== null ? "Vote entfernt" : "Vote wurde gezählt");
    } catch (err) {
      console.error("Error voting:", err);
      toast.error("Fehler beim Abstimmen");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => handleVote(true)}
        disabled={isVoting}
        className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
          userVote === true
            ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
            : "hover:bg-gray-100"
        }`}
        title={userVote === true ? "Klicken zum Entfernen" : "Upvote"}
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
        onClick={() => handleVote(false)}
        disabled={isVoting}
        className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
          userVote === false
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "hover:bg-gray-100"
        }`}
        title={userVote === false ? "Klicken zum Entfernen" : "Downvote"}
      >
        <span className="text-xl">👎</span>
      </button>
    </div>
  );
}

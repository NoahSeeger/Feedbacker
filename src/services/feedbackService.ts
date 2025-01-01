import { supabase } from "../config/supabaseClient";

interface DeleteFeedbackParams {
  feedbackId: string;
  userId?: string;
  sessionId: string;
}

export async function deleteFeedback({
  feedbackId,
  userId,
  sessionId,
}: DeleteFeedbackParams) {
  try {
    // Feedback-Eintrag abrufen zur Berechtigungsprüfung
    const { data: feedbackData, error: feedbackError } = await supabase
      .from("feedback_items")
      .select("id, user_id, session_id")
      .eq("id", feedbackId)
      .single();

    if (feedbackError) {
      throw new Error("Feedback konnte nicht gefunden werden");
    }

    if (!feedbackData) {
      throw new Error("Feedback nicht gefunden");
    }

    // Berechtigungsprüfung
    const canDelete =
      (userId && feedbackData.user_id === userId) || // Eingeloggter User
      (!userId && feedbackData.session_id === sessionId); // Nicht eingeloggter User mit session_id

    if (!canDelete) {
      throw new Error("Keine Berechtigung zum Löschen");
    }

    // Erst die Votes löschen
    await supabase
      .from("feedback_votes")
      .delete()
      .eq("feedback_id", feedbackId);

    // Dann das Feedback löschen
    const { error: deleteError } = await supabase
      .from("feedback_items")
      .delete()
      .eq("id", feedbackId);

    if (deleteError) {
      throw new Error("Fehler beim Löschen des Feedbacks");
    }

    return { success: true };
  } catch (error) {
    console.error("Delete feedback error:", error);
    throw error;
  }
}

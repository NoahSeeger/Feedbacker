export const deleteFeedback = async (req: Request, res: Response) => {
  const { id } = req.params;
  const sessionId = req.headers["x-session-id"];

  try {
    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback nicht gefunden" });
    }

    // Überprüfe, ob der Benutzer berechtigt ist
    if (feedback.sessionId !== sessionId && !req.user) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }

    await feedback.remove();
    res.status(200).json({ message: "Feedback erfolgreich gelöscht" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server-Fehler beim Löschen des Feedbacks" });
  }
};

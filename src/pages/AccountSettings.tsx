import { useState } from "react";
import { supabase } from "../config/supabaseClient";
import { toast } from "react-hot-toast";

export default function AccountSettings({ user }: { user: any }) {
  const [newPassword, setNewPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      toast.success("Passwort wurde erfolgreich geändert");
      setNewPassword("");
    } catch (err) {
      toast.error("Fehler beim Ändern des Passworts");
    }
  };

  const handleDeleteAccount = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }

    try {
      // Erst alle User-Daten löschen
      const { error: dataError } = await supabase
        .from("feedback_boards")
        .delete()
        .eq("user_id", user.id);

      if (dataError) throw dataError;

      // Dann Account löschen
      const { error: authError } = await supabase.auth.admin.deleteUser(
        user.id
      );
      if (authError) throw authError;

      toast.success("Account wurde gelöscht");
      // Redirect zur Landing Page
    } catch (err) {
      toast.error("Fehler beim Löschen des Accounts");
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Account Einstellungen</h1>

      {/* Passwort ändern */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Passwort ändern</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Neues Passwort"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Passwort ändern
          </button>
        </form>
      </div>

      {/* Account löschen */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">Account löschen</h2>
        <p className="text-gray-600 mb-4">
          Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          {isDeleting ? "Wirklich löschen?" : "Account löschen"}
        </button>
      </div>
    </div>
  );
}

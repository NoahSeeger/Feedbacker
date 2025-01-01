import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface UserProfile {
  email: string;
  created_at: string;
  last_sign_in_at: string;
}

export default function AccountSettings({ user }: { user: any }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    setUserProfile({
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    });
    setIsLoading(false);
  }, [user, navigate]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("toast.account.passwordMismatch"));
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success(t("toast.account.passwordChanged"));
      setIsChangingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(t("toast.account.passwordError"));
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(t("account.deleteConfirm"));

    if (confirmation) {
      try {
        // 1. Lösche zuerst alle Feedback-Votes des Users
        const { error: votesError } = await supabase
          .from("feedback_votes")
          .delete()
          .eq("user_id", user.id);

        if (votesError) throw votesError;

        // 2. Lösche alle Feedback-Items des Users
        const { error: itemsError } = await supabase
          .from("feedback_items")
          .delete()
          .eq("user_id", user.id);

        if (itemsError) throw itemsError;

        // 3. Lösche alle Feedback-Boards des Users
        const { error: boardsError } = await supabase
          .from("feedback_boards")
          .delete()
          .eq("user_id", user.id);

        if (boardsError) throw boardsError;

        // 4. Markiere den User als gelöscht durch Aktualisierung der Metadaten
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            deleted: true,
            deleted_at: new Date().toISOString(),
            // Weitere Metadaten...
          },
        });

        if (updateError) throw updateError;

        // 5. Ausloggen und zur Startseite navigieren
        await supabase.auth.signOut();
        navigate("/");
        toast.success(t("toast.account.deleteSuccess"));
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error(t("toast.account.deleteError"));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {t("accountSettings.title")}
          </h1>

          {/* Account Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("accountSettings.information.title")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  {t("accountSettings.information.email")}
                </label>
                <p className="mt-1 text-gray-900">{userProfile?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  {t("accountSettings.information.createdAt")}
                </label>
                <p className="mt-1 text-gray-900">
                  {new Date(userProfile?.created_at || "").toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  {t("accountSettings.information.lastLogin")}
                </label>
                <p className="mt-1 text-gray-900">
                  {new Date(
                    userProfile?.last_sign_in_at || ""
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("accountSettings.password.title")}
            </h2>
            {!isChangingPassword ? (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {t("accountSettings.password.changeButton")}
              </button>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-600"
                  >
                    {t("accountSettings.password.newPassword")}
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-600"
                  >
                    {t("accountSettings.password.confirmPassword")}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {t("accountSettings.password.save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    {t("accountSettings.password.cancel")}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Delete Account Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("accountSettings.deleteAccount.title")}
            </h2>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              {t("accountSettings.deleteAccount.button")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../config/supabaseClient";

export default function AuthComponent() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
      {/*       <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Jetzt loslegen
      </h2> */}
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: "#2563eb",
                brandAccent: "#1d4ed8",
              },
            },
          },
          style: {
            button: {
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "10px",
            },
            input: {
              width: "100%",
              padding: "8px 12px",
              borderRadius: "6px",
              marginBottom: "12px",
            },
            container: {
              width: "100%",
            },
            divider: {
              margin: "20px 0",
            },
            message: {
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "6px",
            },
          },
        }}
        providers={["google", "github"]}
        localization={{
          variables: {
            sign_in: {
              email_label: "E-Mail",
              password_label: "Passwort",
              button_label: "Anmelden",
              loading_button_label: "Wird angemeldet...",
              social_provider_text: "Anmelden mit {{provider}}",
              link_text: "Bereits ein Konto? Anmelden",
            },
            sign_up: {
              email_label: "E-Mail",
              password_label: "Passwort",
              button_label: "Konto erstellen",
              loading_button_label: "Wird registriert...",
              social_provider_text: "Registrieren mit {{provider}}",
              link_text: "Kein Konto? Registrieren",
            },
          },
        }}
      />
    </div>
  );
}

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PostHogProvider } from "posthog-js/react";
import "./index.css";
import "./i18n";

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  loaded: (posthog) => {
    if (import.meta.env.DEV) posthog.opt_out_capturing();
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={options}
    >
      <App />
    </PostHogProvider>
  </React.StrictMode>
);

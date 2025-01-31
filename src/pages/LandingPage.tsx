import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Features from "../components/Features";

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center gap-6">
        <a
          href="https://www.producthunt.com/posts/feedbacker-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-feedbacker&#0045;2"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-90 transition-opacity"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=749158&theme=light"
            alt="Feedbacker - Easy feedback collection | Product Hunt"
            width="250"
            height="54"
            style={{ width: "250px", height: "54px" }}
          />
        </a>
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="block text-gray-900">{t("landing.title")}</span>
            <span className="block text-blue-600 mt-1">
              {t("landing.subtitle")}
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600">
            {t("landing.description")}
          </p>
          <div className="mt-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {t("landing.viewBoards")}
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Features />
        </div>
      </div>
    </div>
  );
}

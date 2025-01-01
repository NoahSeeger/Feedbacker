import { useTranslation } from "react-i18next";

export default function Features() {
  const { t } = useTranslation();

  const features = [
    {
      title: t("landing.features.anonymous.title"),
      description: t("landing.features.anonymous.description"),
      icon: "🎭",
    },
    {
      title: t("landing.features.sharing.title"),
      description: t("landing.features.sharing.description"),
      icon: "🔗",
    },
    {
      title: t("landing.features.voting.title"),
      description: t("landing.features.voting.description"),
      icon: "👍",
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
        {t("landing.features.headline")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

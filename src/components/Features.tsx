export default function Features() {
  const features = [
    {
      title: "Anonymes Feedback",
      description:
        "Keine Anmeldung erforderlich. Teilnehmer können direkt und anonym Feedback geben.",
      icon: "🎭",
    },
    {
      title: "Einfaches Teilen",
      description:
        "Teile dein Feedback-Board mit einem Link. Keine komplizierte Einrichtung nötig.",
      icon: "🔗",
    },
    {
      title: "Community Voting",
      description:
        "Lass die Gemeinschaft die besten Ideen durch Up- und Down-Voting finden.",
      icon: "👍",
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
        Einfach. Anonym. Effektiv.
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

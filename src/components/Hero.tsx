export default function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="text-center max-w-4xl mx-auto">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
        <span className="block text-gray-900">Sammle wertvolles</span>
        <span className="block text-blue-600 mt-1">Feedback</span>
      </h1>
      <p className="mt-6 text-lg sm:text-xl text-gray-600">
        Mit Feedbacker kannst du einfach und anonym Feedback sammeln. Erstelle
        ein Board, teile den Link und lass die Community die besten Ideen
        finden.
      </p>
      <div className="mt-8">
        <button
          onClick={onGetStarted}
          className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Jetzt starten
        </button>
      </div>
    </div>
  );
}

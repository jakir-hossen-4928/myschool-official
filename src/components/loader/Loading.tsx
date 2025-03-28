import React from 'react';

const Loading = () => {
  // Fun educational facts to display while loading
  const funFacts = [
    "Did you know? The average person spends about 180 days of their life in school.",
    "Pro tip: Taking short breaks while studying improves memory retention.",
    "Fun fact: Finland has one of the best education systems in the world.",
    "Study hack: Teaching someone else is the best way to learn.",
    "Did you know? The world's oldest school was founded in 597 AD.",
  ];

  // Randomly select a fact
  const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center gap-6 px-4 py-8">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden opacity-10 dark:opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-[gradientShift_8s_ease_infinite]"></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        {/* Logo with more sophisticated animation */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-blue-100 dark:bg-blue-900 rounded-2xl opacity-60 animate-[pulse_2s_ease-in-out_infinite]"></div>
          <div className="relative animate-[bounce_2s_ease-in-out_infinite]">
            <img
              src="/my-school-logo.jpg"
              alt="MySchool Logo"
              width={120}
              height={120}
              className="rounded-xl shadow-lg border-4 border-white dark:border-gray-800"
            />
          </div>
        </div>

        {/* App title with multilingual support */}
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2">
          MySchool - মাইস্কুল
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Your Digital Learning Companion</p>

        {/* Dynamic progress indicator */}
        <div className="w-full max-w-xs mb-6">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
            <span>Loading...</span>
            <span className="animate-[countUp_2s_linear_infinite]">45%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-[progress_1.5s_ease-in-out_infinite]"
              style={{ width: '45%' }}
            ></div>
          </div>
        </div>

        {/* Fun fact box */}
        <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-xl border border-blue-100 dark:border-gray-700 w-full mb-6 animate-[fadeIn_1s_ease-in-out]">
          <div className="flex items-start">
            <span className="text-blue-500 dark:text-blue-400 mr-2 mt-0.5">💡</span>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Did You Know?</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{randomFact}</p>
            </div>
          </div>
        </div>

        {/* Tips for using the app */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs">
            <div className="text-blue-500 dark:text-blue-400 mb-1">📚</div>
            <p className="text-xs text-gray-600 dark:text-gray-300">Organize your study materials</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs">
            <div className="text-purple-500 dark:text-purple-400 mb-1">📅</div>
            <p className="text-xs text-gray-600 dark:text-gray-300">Track your class schedule</p>
          </div>
        </div>

        {/* Animated dots */}
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full animate-[bounce_1.5s_infinite]"
              style={{ animationDelay: `${i * 0.15}s` }}
            ></div>
          ))}
        </div>
      </div>

      {/* Footer with responsive text */}
      <p className="absolute bottom-4 text-xs text-gray-500 dark:text-gray-400 text-center px-4">
        {window.innerWidth > 640 ?
          "Preparing your personalized learning experience..." :
          "Loading your experience..."}
      </p>

      {/* Add custom animations to tailwind config */}
      <style jsx global>{`
        @keyframes gradientShift {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.5) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes countUp {
          0% { content: "0%"; }
          100% { content: "45%"; }
        }
      `}</style>
    </div>
  );
};

export default Loading;
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Trophy, Star, Sparkles, X } from 'lucide-react';

const AchievementUnlockModal = ({ achievement, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // Auto hide confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'from-gray-500 to-gray-600',
      rare: 'from-blue-500 to-blue-600',
      epic: 'from-purple-500 to-purple-600',
      legendary: 'from-yellow-400 to-yellow-600'
    };
    return colors[rarity] || colors.common;
  };

  const getRarityGlow = (rarity) => {
    const glows = {
      common: 'shadow-gray-500/50',
      rare: 'shadow-blue-500/50',
      epic: 'shadow-purple-500/50',
      legendary: 'shadow-yellow-500/50'
    };
    return glows[rarity] || glows.common;
  };

  if (!achievement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
          recycle={false}
          gravity={0.3}
        />
      )}

      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 max-w-md w-full animate-bounce-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-gray-800 hover:bg-gray-700 rounded-full p-2 text-white z-20 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Achievement Card */}
        <div 
          className={`bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-2xl p-8 shadow-2xl ${getRarityGlow(achievement.rarity)} border-4 border-white/20 transform hover:scale-105 transition-transform`}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                {/* Sparkle Effects */}
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" />
                <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-yellow-300 animate-pulse delay-75" />
                
                {/* Trophy Icon */}
                <div className="bg-white/20 rounded-full p-4 backdrop-blur-sm">
                  <Trophy className="w-12 h-12 text-white animate-bounce" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2 animate-fade-in">
              Achievement Unlocked!
            </h2>
            
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/30 backdrop-blur-sm text-white mb-4`}>
              {achievement.rarity.toUpperCase()}
            </div>
          </div>

          {/* Achievement Icon */}
          <div className="flex justify-center mb-6">
            <div className="text-8xl animate-scale-in filter drop-shadow-2xl">
              {achievement.icon}
            </div>
          </div>

          {/* Achievement Name */}
          <h3 className="text-2xl font-bold text-white text-center mb-3 animate-slide-up">
            {achievement.name}
          </h3>

          {/* Achievement Description */}
          <p className="text-white/90 text-center mb-6 text-lg animate-slide-up delay-100">
            {achievement.description}
          </p>

          {/* Points Badge */}
          <div className="flex justify-center items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 animate-slide-up delay-200">
            <Star className="w-6 h-6 text-yellow-300" />
            <span className="text-2xl font-bold text-white">
              +{achievement.points} Points
            </span>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-white/20 to-transparent rounded-full blur-3xl animate-pulse delay-150" />
          </div>

          {/* Shine Effect */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
          </div>
        </div>

        {/* Close Hint */}
        <div className="text-center mt-4 text-white/70 text-sm animate-fade-in delay-300">
          Click anywhere to continue
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0) translateY(-100px);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes slide-up {
          0% {
            transform: translateY(30px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(30deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(30deg);
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-scale-in {
          animation: scale-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s both;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out 0.5s both;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out 0.6s both;
        }

        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }

        .delay-75 {
          animation-delay: 75ms;
        }

        .delay-100 {
          animation-delay: 100ms;
        }

        .delay-150 {
          animation-delay: 150ms;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
};

export default AchievementUnlockModal;

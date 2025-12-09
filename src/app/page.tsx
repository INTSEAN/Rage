import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gamepad2, Skull, Zap, TrendingUp, AlertTriangle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Skull className="w-12 h-12 text-red-500 animate-pulse" />
            <h1 className="text-6xl font-bold text-white">
              <span className="text-red-500">Rage</span>
            </h1>
            <Skull className="w-12 h-12 text-red-500 animate-pulse" />
          </div>
          <p className="text-2xl text-gray-300 mb-2">
            A devilishly tricky platformer
          </p>
          <p className="text-yellow-400 italic text-lg">
            "Nothing is as it seems..."
          </p>
        </div>

        {/* Game Preview Card */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full border border-purple-500/30 shadow-2xl mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Can you reach the exit?
          </h2>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 bg-purple-900/30 p-4 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-1">Trick Mechanics</h3>
                <p className="text-gray-400 text-sm">
                  Fake exits, disappearing platforms, gravity zones, and deadly surprises
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-purple-900/30 p-4 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-1">Progressive Difficulty</h3>
                <p className="text-gray-400 text-sm">
                  15 levels with boss battles and gravity-defying challenges
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-purple-900/30 p-4 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-1">Deadly Traps</h3>
                <p className="text-gray-400 text-sm">
                  Spikes, lava, spinning razors, and crushing platforms
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-purple-900/30 p-4 rounded-lg">
              <Gamepad2 className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-1">Multiplayer Mode</h3>
                <p className="text-gray-400 text-sm">
                  Play with friends using room codes (up to 8 players)
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-slate-800/50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              How to Play
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">→</span>
                <span>Use <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">Arrow Keys</kbd> or <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">WASD</kbd> to move</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">→</span>
                <span>Press <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">Space</kbd>, <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">W</kbd>, or <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">↑</kbd> to jump</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">→</span>
                <span>Reach the EXIT to complete each level</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">→</span>
                <span>Navigate gravity zones - purple for anti-gravity, red for heavy gravity!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">⚠</span>
                <span className="text-yellow-300">Watch out! Not everything is what it seems...</span>
              </li>
            </ul>
          </div>

          {/* Play Button */}
          <Link href="/game" className="block">
            <Button
              size="lg"
              className="w-full text-xl py-6 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Gamepad2 className="w-6 h-6 mr-2" />
              Start Playing
            </Button>
          </Link>
        </div>

        {/* Warning Footer */}
        <div className="text-center text-gray-400 text-sm max-w-md">
          <p className="flex items-center justify-center gap-2">
            <Skull className="w-4 h-4 text-red-500" />
            <span>Warning: This game will test your patience and trust issues</span>
            <Skull className="w-4 h-4 text-red-500" />
          </p>
        </div>
      </main>
    </div>
  );
}
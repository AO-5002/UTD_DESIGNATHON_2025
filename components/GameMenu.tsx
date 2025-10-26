"use client";

import { GameCard } from "./GameCard";
import { Dices, Gamepad2, Trophy, Puzzle, Swords } from "lucide-react";

export type Game = {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  onClick: () => void;
};

type GamesMenuProps = {
  onGameSelect?: (gameId: string) => void;
};

export function GamesMenu({ onGameSelect }: GamesMenuProps) {
  // Define your games here - easily add more!
  const games: Game[] = [
    {
      id: "mind-turf",
      title: "Mind Turf",
      description: "Blast your opponent to have your idea posted!",
      color: "#bacded",
      icon: <Swords size={48} />,
      onClick: () => {
        console.log("Starting Dice Game");
        onGameSelect?.("dice-game");
        // Add your game logic here
        alert("Dice Game coming soon!");
      },
    },
    // Uncomment and customize these to add more games:
    /*
    {
      id: "trivia",
      title: "Team Trivia",
      description: "Answer questions with your team",
      color: "#f7bbdc",
      icon: <Gamepad2 size={48} />,
      onClick: () => {
        console.log("Starting Trivia");
        onGameSelect?.("trivia");
        alert("Trivia coming soon!");
      },
    },
    {
      id: "puzzle",
      title: "Quick Puzzle",
      description: "Solve puzzles together",
      color: "#ddedab",
      icon: <Puzzle size={48} />,
      onClick: () => {
        console.log("Starting Puzzle");
        onGameSelect?.("puzzle");
        alert("Puzzle coming soon!");
      },
    },
    {
      id: "challenge",
      title: "Team Challenge",
      description: "Compete in fun challenges",
      color: "#ffd7d7",
      icon: <Trophy size={48} />,
      onClick: () => {
        console.log("Starting Challenge");
        onGameSelect?.("challenge");
        alert("Challenge coming soon!");
      },
    },
    */
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Games</h2>
        <p className="text-gray-600">Choose a game to play with your team</p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <GameCard
            key={game.id}
            title={game.title}
            description={game.description}
            color={game.color}
            icon={game.icon}
            onClick={game.onClick}
          />
        ))}
      </div>

      {/* Empty State (shows when no games) */}
      {games.length === 0 && (
        <div className="text-center py-16">
          <Gamepad2 size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No games available yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Check back soon for new games!
          </p>
        </div>
      )}
    </div>
  );
}

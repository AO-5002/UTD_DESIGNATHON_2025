"use client";

import RoomLayout from "@/layouts/RoomLayout";
import React, { useMemo, useState } from "react";
import InfiniteCanvas from "./infinite-canvas";
import { PuzzlePiece } from "@/components/PuzzlePiece";
import { useParams } from "next/navigation";
import { RoomProvider, useStorage, useMutation } from "@/Liveblocks.config";
import { Blocks, Dices, Video, UserRound } from "lucide-react";
import { DockItemData } from "@/components/Dock";

const PIECE_SIZE = 120;
const GAP = 20;

type PieceData = {
  id: string;
  color: string;
  text: string;
  type?: "regular" | "consolidated";
  gridSpan?: { rows: number; cols: number }; // For consolidated pieces
  sourceIds?: string[]; // IDs of original pieces
};

const COLORS = [
  "#bacded",
  "#f7bbdc",
  "#ddedab",
  "#ffd7d7",
  "#f6db70",
  "#ffcaca",
  "#b8e6d5",
  "#ffd9b3",
  "#e6ccff",
  "#ffe0b3",
];

// Main room content component
function RoomContent() {
  const [isConsolidating, setIsConsolidating] = useState(false);
  const pieces = useStorage((root) => root.pieces) || [];

  const gridSize = useMemo(() => {
    const regularPieces = pieces.filter(
      (p: PieceData) => p.type !== "consolidated"
    );
    const count = regularPieces.length;
    if (count === 0) return 3;

    let size = 3;
    while (size * size < count) {
      size += 2;
    }
    return size;
  }, [pieces]);

  const getGridPosition = (index: number) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    const totalWidth = gridSize * PIECE_SIZE + (gridSize - 1) * GAP;
    const totalHeight = gridSize * PIECE_SIZE + (gridSize - 1) * GAP;

    const startX = 500 - totalWidth / 2;
    const startY = 400 - totalHeight / 2;

    return {
      x: startX + col * (PIECE_SIZE + GAP),
      y: startY + row * (PIECE_SIZE + GAP),
    };
  };

  // Calculate size for consolidated piece that spans the grid
  const getConsolidatedDimensions = () => {
    const totalWidth = gridSize * PIECE_SIZE + (gridSize - 1) * GAP;
    const totalHeight = gridSize * PIECE_SIZE + (gridSize - 1) * GAP;

    return {
      width: totalWidth,
      height: totalHeight,
      x: 500 - totalWidth / 2,
      y: 400 - totalHeight / 2,
    };
  };

  const updatePieceText = useMutation(
    ({ storage }, id: string, text: string) => {
      const pieces = storage.get("pieces");
      const newPieces = pieces.map((p: PieceData) =>
        p.id === id ? { ...p, text } : p
      );
      storage.set("pieces", newPieces);
    },
    []
  );

  const deletePiece = useMutation(({ storage }, id: string) => {
    const pieces = storage.get("pieces");
    const newPieces = pieces.filter((p: PieceData) => p.id !== id);
    storage.set("pieces", newPieces);
  }, []);

  const duplicatePiece = useMutation(({ storage }, id: string) => {
    const pieces = storage.get("pieces");
    const original = pieces.find((p: PieceData) => p.id === id);
    if (original) {
      const newPiece: PieceData = {
        id: `piece${Date.now()}`,
        color: original.color,
        text: `${original.text} (Copy)`,
        type: original.type || "regular",
      };
      storage.set("pieces", [...pieces, newPiece]);
    }
  }, []);

  const addPiece = useMutation(({ storage }) => {
    const pieces = storage.get("pieces");
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newPiece: PieceData = {
      id: `piece${Date.now()}`,
      color: randomColor,
      text: "",
      type: "regular",
    };
    storage.set("pieces", [...pieces, newPiece]);
  }, []);

  // Consolidate all pieces with AI
  const consolidateIdeas = useMutation(
    async ({ storage }) => {
      const pieces = storage.get("pieces");
      const regularPieces = pieces.filter(
        (p: PieceData) => p.type !== "consolidated"
      );

      if (regularPieces.length === 0) {
        alert("No pieces to consolidate!");
        return;
      }

      setIsConsolidating(true);

      try {
        // Call OpenAI API
        const response = await fetch("/api/consolidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pieces: regularPieces }),
        });

        if (!response.ok) {
          throw new Error("Failed to consolidate ideas");
        }

        const { consolidatedText } = await response.json();

        // Create one big consolidated piece
        const consolidatedPiece: PieceData = {
          id: `consolidated-${Date.now()}`,
          color: "#e6ccff", // Purple color for AI block
          text: consolidatedText,
          type: "consolidated",
          gridSpan: { rows: gridSize, cols: gridSize },
          sourceIds: regularPieces.map((p: PieceData) => p.id),
        };

        // Replace all pieces with the consolidated one
        storage.set("pieces", [consolidatedPiece]);
      } catch (error) {
        console.error("Error consolidating:", error);
        alert("Failed to consolidate ideas. Check console for details.");
      } finally {
        setIsConsolidating(false);
      }
    },
    [gridSize]
  );

  // Custom navbar items
  const navbarItems: DockItemData[] = [
    {
      icon: <Blocks size={24} />,
      label: "Add Puzzle Piece",
      onClick: () => addPiece(),
    },
    {
      icon: <Dices size={24} />,
      label: "Games",
      onClick: () => alert("Games!"),
    },
    {
      icon: <Video size={24} />,
      label: "Call",
      onClick: () => alert("Call!"),
    },
    {
      icon: <UserRound size={24} />,
      label: "Profile",
      onClick: () => alert("Profile!"),
    },
  ];

  // Separate regular and consolidated pieces
  const regularPieces = pieces.filter(
    (p: PieceData) => p.type !== "consolidated"
  );
  const consolidatedPieces = pieces.filter(
    (p: PieceData) => p.type === "consolidated"
  );

  return (
    // @ts-ignore: RoomLayout props type doesn't include onConsolidateIdeas, pass it through for behavior
    <RoomLayout navbarItems={navbarItems} onConsolidateIdeas={consolidateIdeas}>
      <InfiniteCanvas>
        <div className="relative">
          {/* Loading overlay */}
          {isConsolidating && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="text-lg font-semibold text-gray-800">
                  AI is consolidating your ideas...
                </p>
              </div>
            </div>
          )}

          {/* Grid size indicator */}
          <div
            className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-lg shadow-md border-2 border-gray-300 z-50"
            style={{ position: "fixed" }}
          >
            <p className="text-sm font-medium text-gray-700">
              Grid:{" "}
              <span className="font-bold text-black">
                {gridSize}×{gridSize}
              </span>
              <span className="text-gray-500 ml-2">
                ({regularPieces.length} pieces)
              </span>
            </p>
          </div>

          {/* Regular pieces in grid */}
          {regularPieces.map((piece: PieceData, index: number) => {
            const position = getGridPosition(index);
            return (
              <div
                key={piece.id}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  left: position.x,
                  top: position.y,
                }}
              >
                <PuzzlePiece
                  id={piece.id}
                  color={piece.color}
                  text={piece.text}
                  onTextChange={updatePieceText}
                  onDelete={deletePiece}
                  onDuplicate={duplicatePiece}
                />
              </div>
            );
          })}

          {/* Consolidated pieces (big blocks) */}
          {consolidatedPieces.map((piece: PieceData) => {
            const dims = getConsolidatedDimensions();
            return (
              <div
                key={piece.id}
                className="absolute transition-all duration-700 ease-out"
                style={{
                  left: dims.x,
                  top: dims.y,
                  width: dims.width,
                  height: dims.height,
                }}
              >
                <div
                  className="w-full h-full rounded-3xl border-4 border-purple-600 shadow-2xl p-8 overflow-y-auto"
                  style={{
                    backgroundColor: piece.color,
                    background: `linear-gradient(135deg, ${piece.color} 0%, ${piece.color}dd 100%)`,
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-purple-400">
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-600 text-white rounded-full p-2">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-purple-900">
                        AI Consolidated Ideas
                      </h2>
                    </div>
                    <div className="text-sm text-purple-700 font-medium bg-purple-200 px-3 py-1 rounded-full">
                      {piece.sourceIds?.length || 0} ideas merged
                    </div>
                  </div>

                  {/* AI-generated content */}
                  <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {piece.text}
                  </div>

                  {/* Footer actions */}
                  <div className="mt-8 pt-4 border-t-2 border-purple-400 flex gap-2">
                    <button
                      onClick={() => updatePieceText(piece.id, piece.text)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePiece(piece.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Delete & Start Over
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </InfiniteCanvas>
    </RoomLayout>
  );
}

// Main page component
export default function Page() {
  const params = useParams();
  const roomId = params.roomId as string;

  return (
    <RoomProvider
      id={roomId}
      initialPresence={(roomId: string) => ({} as any)}
      initialStorage={{
        pieces: [
          {
            id: "piece1",
            color: "#bacded",
            text: "Team Goals",
            type: "regular",
          },
          {
            id: "piece2",
            color: "#f7bbdc",
            text: "Marketing Strategy",
            type: "regular",
          },
          {
            id: "piece3",
            color: "#ddedab",
            text: "Development Roadmap",
            type: "regular",
          },
          {
            id: "piece4",
            color: "#ffd7d7",
            text: "Design Sprint",
            type: "regular",
          },
          {
            id: "piece5",
            color: "#f6db70",
            text: "User Research",
            type: "regular",
          },
        ],
        soundEvents: [],
      }}
    >
      <RoomContent />
    </RoomProvider>
  );
}

"use client";

import RoomLayout from "@/layouts/RoomLayout";
import React, { useMemo, useState, useCallback } from "react";
import InfiniteCanvas from "./infinite-canvas";
import { PuzzlePiece } from "@/components/PuzzlePiece";
import { useParams } from "next/navigation";
import {
  RoomProvider,
  useStorage,
  useMutation,
  useOthers,
  useUpdateMyPresence,
} from "@/Liveblocks.config";
import { Blocks, Dices, Video, UserRound } from "lucide-react";
import { DockItemData } from "@/components/Dock";
import { Cursor } from "@/components/Cursor";
import { AnimatePresence } from "framer-motion";

// Constants
const PIECE_SIZE = 120;
const GAP = 20;
const INITIAL_GRID_SIZE = 3;
const GRID_EXPANSION_INCREMENT = 2;

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

const CURSOR_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
  "#F8B739",
  "#52B788",
];

// Types
type PieceData = {
  id: string;
  color: string;
  text: string;
  type?: "regular" | "consolidated";
  gridPositions?: { row: number; col: number }[];
  sourceIds?: string[];
  colors?: string[];
};

// Helper Functions
const calculateGridSize = (totalNeeded: number): number => {
  if (totalNeeded === 0) return INITIAL_GRID_SIZE;

  let size = INITIAL_GRID_SIZE;
  while (size * size < totalNeeded) {
    size += GRID_EXPANSION_INCREMENT;
  }
  return size;
};

const getOccupiedPositions = (consolidatedPieces: PieceData[]): Set<string> => {
  const occupied = new Set<string>();
  consolidatedPieces.forEach((piece) => {
    piece.gridPositions?.forEach((pos) => {
      occupied.add(`${pos.row},${pos.col}`);
    });
  });
  return occupied;
};

// Custom Hooks
const usePieceCategories = (pieces: PieceData[]) => {
  return useMemo(
    () => ({
      regular: pieces.filter((p) => p.type !== "consolidated"),
      consolidated: pieces.filter((p) => p.type === "consolidated"),
    }),
    [pieces]
  );
};

const useGridCalculations = (pieces: PieceData[]) => {
  const { regular, consolidated } = usePieceCategories(pieces);
  const occupiedPositions = useMemo(
    () => getOccupiedPositions(consolidated),
    [consolidated]
  );

  const gridSize = useMemo(() => {
    const totalNeeded = regular.length + occupiedPositions.size;
    return calculateGridSize(totalNeeded);
  }, [regular.length, occupiedPositions.size]);

  const isPositionOccupied = (row: number, col: number): boolean => {
    return occupiedPositions.has(`${row},${col}`);
  };

  const gridToPixel = (row: number, col: number) => {
    const totalWidth = gridSize * PIECE_SIZE + (gridSize - 1) * GAP;
    const totalHeight = gridSize * PIECE_SIZE + (gridSize - 1) * GAP;
    const startX = 500 - totalWidth / 2;
    const startY = 400 - totalHeight / 2;

    return {
      x: startX + col * (PIECE_SIZE + GAP),
      y: startY + row * (PIECE_SIZE + GAP),
    };
  };

  const getGridPosition = (pieceIndex: number) => {
    let currentIndex = 0;
    let gridIndex = 0;

    while (currentIndex <= pieceIndex) {
      const row = Math.floor(gridIndex / gridSize);
      const col = gridIndex % gridSize;

      if (!isPositionOccupied(row, col)) {
        if (currentIndex === pieceIndex) {
          const position = gridToPixel(row, col);
          return { ...position, row, col };
        }
        currentIndex++;
      }
      gridIndex++;
    }

    return { x: 0, y: 0, row: 0, col: 0 };
  };

  return {
    gridSize,
    occupiedPositions,
    isPositionOccupied,
    gridToPixel,
    getGridPosition,
    regularPieces: regular,
    consolidatedPieces: consolidated,
  };
};

// Generate random name
const generateRandomName = () => {
  const adjectives = [
    "Happy",
    "Clever",
    "Swift",
    "Bright",
    "Cool",
    "Wise",
    "Bold",
    "Calm",
  ];
  const nouns = [
    "Panda",
    "Fox",
    "Tiger",
    "Eagle",
    "Lion",
    "Bear",
    "Wolf",
    "Owl",
  ];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${
    nouns[Math.floor(Math.random() * nouns.length)]
  }`;
};

// Main Room Content Component
function RoomContent() {
  const [isConsolidating, setIsConsolidating] = useState(false);
  const pieces = useStorage((root) => root.pieces) || [];
  const {
    gridSize,
    gridToPixel,
    getGridPosition,
    regularPieces,
    consolidatedPieces,
  } = useGridCalculations(pieces);

  // Cursor tracking
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      updateMyPresence({
        cursor: {
          x: e.clientX,
          y: e.clientY,
        },
      });
    },
    [updateMyPresence]
  );

  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  // Mutations
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
        const response = await fetch("/api/consolidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pieces: regularPieces,
            simple: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to consolidate ideas");
        }

        const { consolidatedText } = await response.json();

        const regularPiecesWithPositions = regularPieces.map(
          (p: PieceData, index: number) => {
            const pos = getGridPosition(index);
            return {
              ...p,
              gridPosition: { row: pos.row, col: pos.col },
            };
          }
        );

        const gridPositions = regularPiecesWithPositions.map(
          (p: any) => p.gridPosition
        );

        const uniqueColors = [
          ...new Set(regularPieces.map((p: PieceData) => p.color)),
        ];

        const consolidatedPiece: PieceData = {
          id: `consolidated-${Date.now()}`,
          color: uniqueColors.length > 0 ? uniqueColors[0] : "#e6ccff",
          text: consolidatedText,
          type: "consolidated",
          gridPositions: gridPositions,
          sourceIds: regularPieces.map((p: PieceData) => p.id),
          colors: uniqueColors,
        };

        const otherConsolidatedPieces = pieces.filter(
          (p: PieceData) => p.type === "consolidated"
        );
        storage.set("pieces", [...otherConsolidatedPieces, consolidatedPiece]);
      } catch (error: any) {
        console.error("Error consolidating:", error);
        alert(`Failed to consolidate ideas: ${error.message}`);
      } finally {
        setIsConsolidating(false);
      }
    },
    [getGridPosition]
  );

  const addPiece = useMutation(
    ({ storage }) => {
      const pieces = storage.get("pieces");
      const regularPieces = pieces.filter(
        (p: PieceData) => p.type !== "consolidated"
      );
      const consolidatedPieces = pieces.filter(
        (p: PieceData) => p.type === "consolidated"
      );

      const occupiedPositions = getOccupiedPositions(consolidatedPieces);

      const currentTotal = regularPieces.length + occupiedPositions.size;
      const nextTotal = currentTotal + 1;

      const currentGridSize = calculateGridSize(currentTotal);
      const nextGridSize = calculateGridSize(nextTotal);

      if (nextGridSize > currentGridSize && regularPieces.length > 0) {
        setTimeout(async () => {
          await consolidateIdeas();
          setTimeout(() => {
            const pieces = storage.get("pieces");
            const randomColor =
              COLORS[Math.floor(Math.random() * COLORS.length)];
            const newPiece: PieceData = {
              id: `piece${Date.now()}`,
              color: randomColor,
              text: "",
              type: "regular",
            };
            storage.set("pieces", [...pieces, newPiece]);
          }, 500);
        }, 100);
        return;
      }

      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const newPiece: PieceData = {
        id: `piece${Date.now()}`,
        color: randomColor,
        text: "",
        type: "regular",
      };
      storage.set("pieces", [...pieces, newPiece]);
    },
    [consolidateIdeas]
  );

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

  return (
    <RoomLayout navbarItems={navbarItems} onConsolidateIdeas={consolidateIdeas}>
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="w-full h-full"
      >
        <InfiniteCanvas>
          <div className="relative">
            {isConsolidating && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <p className="text-lg font-semibold text-gray-800">
                    AI is consolidating your ideas...
                  </p>
                </div>
              </div>
            )}

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
                  ({regularPieces.length} pieces, {consolidatedPieces.length}{" "}
                  consolidated)
                </span>
              </p>
            </div>

            {consolidatedPieces.map((piece: PieceData) => {
              if (!piece.gridPositions || piece.gridPositions.length === 0) {
                return null;
              }

              const minRow = Math.min(...piece.gridPositions.map((p) => p.row));
              const maxRow = Math.max(...piece.gridPositions.map((p) => p.row));
              const minCol = Math.min(...piece.gridPositions.map((p) => p.col));
              const maxCol = Math.max(...piece.gridPositions.map((p) => p.col));

              const topLeft = gridToPixel(minRow, minCol);

              const numCols = maxCol - minCol + 1;
              const numRows = maxRow - minRow + 1;
              const totalWidth = numCols * PIECE_SIZE + (numCols - 1) * GAP;
              const totalHeight = numRows * PIECE_SIZE + (numRows - 1) * GAP;

              return (
                <div
                  key={piece.id}
                  className="absolute transition-all duration-700 ease-out group"
                  style={{
                    left: topLeft.x,
                    top: topLeft.y,
                    width: totalWidth,
                    height: totalHeight,
                  }}
                >
                  <div
                    className="w-full h-full rounded-2xl border-4 border-purple-600 shadow-2xl p-4 overflow-y-auto flex flex-col"
                    style={{
                      backgroundColor: piece.color,
                      background: `linear-gradient(135deg, ${piece.color} 0%, ${piece.color}dd 100%)`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-purple-600 text-white rounded-full p-1.5">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold text-purple-900">
                        AI Summary
                      </h3>
                    </div>
                    <div className="text-xs text-gray-800 leading-relaxed flex-1">
                      {piece.text}
                    </div>
                    <div className="text-xs text-purple-700 font-medium mt-3 pt-3 border-t border-purple-400">
                      {piece.sourceIds?.length || 0} ideas merged ({numRows}×
                      {numCols} grid)
                    </div>
                  </div>

                  <button
                    onClick={() => deletePiece(piece.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg z-10"
                    title="Delete merged block"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              );
            })}

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
          </div>
        </InfiniteCanvas>

        {/* Other users' cursors */}
        <AnimatePresence>
          {others.map(({ connectionId, presence }) => {
            if (!presence.cursor) return null;

            return (
              <Cursor
                key={connectionId}
                x={presence.cursor.x}
                y={presence.cursor.y}
                name={presence.name}
                color={presence.color}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </RoomLayout>
  );
}

// Main page component
export default function Page() {
  const params = useParams();
  const roomId = params.roomId as string;

  // Generate random user name and color
  const userName = useMemo(() => generateRandomName(), []);
  const userColor = useMemo(
    () => CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)],
    []
  );

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        name: userName,
        color: userColor,
      }}
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

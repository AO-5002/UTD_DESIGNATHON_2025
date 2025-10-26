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
  gridPositions?: { row: number; col: number }[]; // Positions this piece occupies
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

  // Helper function to check if a grid position is occupied by a consolidated piece
  const isPositionOccupiedByConsolidated = (row: number, col: number) => {
    const consolidatedPieces = pieces.filter(
      (p: PieceData) => p.type === "consolidated"
    );
    return consolidatedPieces.some((p: PieceData) =>
      p.gridPositions?.some((pos) => pos.row === row && pos.col === col)
    );
  };

  // Get available grid positions for regular pieces (excluding consolidated positions)
  const getAvailablePositions = useMemo(() => {
    const consolidatedPieces = pieces.filter(
      (p: PieceData) => p.type === "consolidated"
    );
    const occupiedPositions = new Set<string>();

    consolidatedPieces.forEach((p: PieceData) => {
      p.gridPositions?.forEach((pos) => {
        occupiedPositions.add(`${pos.row},${pos.col}`);
      });
    });

    return occupiedPositions;
  }, [pieces]);

  // Calculate grid size based on ALL pieces (regular + space needed)
  const gridSize = useMemo(() => {
    const regularPieces = pieces.filter(
      (p: PieceData) => p.type !== "consolidated"
    );
    const totalNeeded = regularPieces.length + getAvailablePositions.size;

    if (totalNeeded === 0) return 3;

    let size = 3;
    while (size * size < totalNeeded) {
      size += 2;
    }
    return size;
  }, [pieces, getAvailablePositions]);

  // Get grid position for regular pieces, skipping occupied consolidated positions
  const getGridPosition = (pieceIndex: number) => {
    let currentIndex = 0;
    let gridIndex = 0;

    // Iterate through grid positions until we find the right one for this piece
    while (currentIndex <= pieceIndex) {
      const row = Math.floor(gridIndex / gridSize);
      const col = gridIndex % gridSize;

      // If this position is not occupied by consolidated, it counts
      if (!isPositionOccupiedByConsolidated(row, col)) {
        if (currentIndex === pieceIndex) {
          const totalWidth = gridSize * PIECE_SIZE + (gridSize - 1) * GAP;
          const totalHeight = gridSize * PIECE_SIZE + (gridSize - 1) * GAP;

          const startX = 500 - totalWidth / 2;
          const startY = 400 - totalHeight / 2;

          return {
            x: startX + col * (PIECE_SIZE + GAP),
            y: startY + row * (PIECE_SIZE + GAP),
            row,
            col,
          };
        }
        currentIndex++;
      }
      gridIndex++;
    }

    // Fallback
    return { x: 0, y: 0, row: 0, col: 0 };
  };

  // Convert grid position to pixel position
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

  // Consolidate all REGULAR pieces with AI
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
        // Call OpenAI API with simpler instructions
        const response = await fetch("/api/consolidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pieces: regularPieces,
            simple: true, // Flag for simpler output
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to consolidate ideas");
        }

        const { consolidatedText } = await response.json();

        // Get all grid positions that regular pieces occupy
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

        // Create consolidated piece that occupies those exact positions
        const consolidatedPiece: PieceData = {
          id: `consolidated-${Date.now()}`,
          color: "#e6ccff", // Purple color for AI block
          text: consolidatedText,
          type: "consolidated",
          gridPositions: gridPositions, // Store all positions this piece covers
          sourceIds: regularPieces.map((p: PieceData) => p.id),
        };

        // Keep other consolidated pieces, but remove the regular pieces that were merged
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
    // @ts-ignore: RoomLayout props type doesn't include onConsolidateIdeas
    <RoomLayout navbarItems={navbarItems} onConsolidateIdeas={consolidateIdeas}>
      <InfiniteCanvas>
        <div className="relative">
          {/* Loading overlay */}
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
                ({regularPieces.length} pieces, {consolidatedPieces.length}{" "}
                consolidated)
              </span>
            </p>
          </div>

          {/* Consolidated pieces - ONE unified block spanning multiple grid cells */}
          {consolidatedPieces.map((piece: PieceData) => {
            if (!piece.gridPositions || piece.gridPositions.length === 0) {
              return null;
            }

            // Calculate the bounding box for the merged shape
            const minRow = Math.min(...piece.gridPositions.map((p) => p.row));
            const maxRow = Math.max(...piece.gridPositions.map((p) => p.row));
            const minCol = Math.min(...piece.gridPositions.map((p) => p.col));
            const maxCol = Math.max(...piece.gridPositions.map((p) => p.col));

            const topLeft = gridToPixel(minRow, minCol);

            // Calculate total width and height INCLUDING gaps between cells
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
                {/* ONE single unified block */}
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

                {/* Delete button */}
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

          {/* Regular pieces in grid (avoiding consolidated positions) */}
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

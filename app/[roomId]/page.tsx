"use client";

import RoomLayout from "@/layouts/RoomLayout";
import React, { useState, useMemo } from "react";
import InfiniteCanvas from "./infinite-canvas";
import { PuzzlePiece } from "@/components/PuzzlePiece";

const PIECE_SIZE = 120;
const GAP = 20;

function Page() {
  const [pieces, setPieces] = useState([
    {
      id: "piece1",
      color: "#bacded",
      text: "Team Goals",
    },
    {
      id: "piece2",
      color: "#f7bbdc",
      text: "Marketing",
    },
    {
      id: "piece3",
      color: "#ddedab",
      text: "Development",
    },
    {
      id: "piece4",
      color: "#ffd7d7",
      text: "Design Sprint",
    },
    {
      id: "piece5",
      color: "#f6db70",
      text: "Research",
    },
  ]);

  // Calculate grid size based on number of pieces
  // 1-9 pieces = 3x3, 10-25 = 5x5, 26-49 = 7x7, etc.
  const gridSize = useMemo(() => {
    const count = pieces.length;
    if (count === 0) return 3;

    // Find the smallest odd number grid that fits all pieces
    let size = 3;
    while (size * size < count) {
      size += 2; // Always odd numbers: 3, 5, 7, 9, etc.
    }
    return size;
  }, [pieces.length]);

  // Calculate grid position for each piece with dynamic centering
  const getGridPosition = (index: number) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    // Calculate the total grid dimensions
    const totalWidth = gridSize * PIECE_SIZE + (gridSize - 1) * GAP;
    const totalHeight = gridSize * PIECE_SIZE + (gridSize - 1) * GAP;

    // Center the grid on the canvas
    const startX = 500 - totalWidth / 2; // Center horizontally around x=500
    const startY = 400 - totalHeight / 2; // Center vertically around y=400

    return {
      x: startX + col * (PIECE_SIZE + GAP),
      y: startY + row * (PIECE_SIZE + GAP),
    };
  };

  const handleTextChange = (id: string, text: string) => {
    setPieces((prev) =>
      prev.map((piece) => (piece.id === id ? { ...piece, text } : piece))
    );
    console.log(`Piece ${id} text updated:`, text);
  };

  const handleDelete = (id: string) => {
    setPieces((prev) => prev.filter((piece) => piece.id !== id));
    console.log(`Piece ${id} deleted - Grid size: ${gridSize}x${gridSize}`);
  };

  const handleDuplicate = (id: string) => {
    const pieceToDuplicate = pieces.find((piece) => piece.id === id);
    if (pieceToDuplicate) {
      const newPiece = {
        ...pieceToDuplicate,
        id: `piece${Date.now()}`,
        text: `${pieceToDuplicate.text} (Copy)`,
      };
      setPieces((prev) => [...prev, newPiece]);
      console.log(
        `Piece ${id} duplicated - Grid size: ${gridSize}x${gridSize}`
      );
    }
  };

  return (
    <RoomLayout>
      <InfiniteCanvas>
        <div className="relative">
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
                ({pieces.length} pieces)
              </span>
            </p>
          </div>

          {pieces.map((piece, index) => {
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
                  onTextChange={handleTextChange}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              </div>
            );
          })}
        </div>
      </InfiniteCanvas>
    </RoomLayout>
  );
}

export default Page;

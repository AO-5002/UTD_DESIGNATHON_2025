"use client";

import RoomLayout from "@/layouts/RoomLayout";
import React, { useMemo } from "react";
import InfiniteCanvas from "./infinite-canvas";
import { PuzzlePiece } from "@/components/PuzzlePiece";
import { useParams } from "next/navigation";
import { RoomProvider, useStorage, useMutation } from "@/Liveblocks.config";

const PIECE_SIZE = 120;
const GAP = 20; // Space between blocks

type PieceData = {
  id: string;
  color: string;
  text: string;
};

// Main room content component
function RoomContent() {
  // Get pieces from Liveblocks storage
  const pieces = useStorage((root) => root.pieces) || [];

  // Calculate grid size based on number of pieces
  const gridSize = useMemo(() => {
    const count = pieces.length;
    if (count === 0) return 3;

    let size = 3;
    while (size * size < count) {
      size += 2;
    }
    return size;
  }, [pieces.length]);

  // Calculate grid position for each piece
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

  // Mutations for updating storage
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
      };
      storage.set("pieces", [...pieces, newPiece]);
    }
  }, []);

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

          {pieces.map((piece: PieceData, index: number) => {
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
          { id: "piece1", color: "#bacded", text: "Team Goals" },
          { id: "piece2", color: "#f7bbdc", text: "Marketing" },
          { id: "piece3", color: "#ddedab", text: "Development" },
          { id: "piece4", color: "#ffd7d7", text: "Design Sprint" },
          { id: "piece5", color: "#f6db70", text: "Research" },
        ],
      }}
    >
      <RoomContent />
    </RoomProvider>
  );
}

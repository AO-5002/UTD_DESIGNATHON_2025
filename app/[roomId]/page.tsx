"use client";

import RoomLayout from "@/layouts/RoomLayout";
import React, { useState, useRef } from "react";
import InfiniteCanvas from "./infinite-canvas";
import { PuzzlePiece } from "@/components/PuzzlePiece";

function Page() {
  const [pieces, setPieces] = useState([
    {
      id: "piece1",
      x: 200,
      y: 200,
      color: "#bacded",
      text: "Team Goals",
    },
    {
      id: "piece2",
      x: 400,
      y: 200,
      color: "#f7bbdc",
      text: "Marketing",
    },
    {
      id: "piece3",
      x: 200,
      y: 400,
      color: "#ddedab",
      text: "Development",
    },
    {
      id: "piece4",
      x: 500,
      y: 400,
      color: "#ffd7d7",
      text: "Design Sprint",
    },
    {
      id: "piece5",
      x: 600,
      y: 250,
      color: "#f6db70",
      text: "Research",
    },
  ]);

  // Shared map to track all piece positions and connections
  const allPiecesRef = useRef(
    new Map<
      string,
      {
        x: number;
        y: number;
        ref: HTMLDivElement | null;
        connections: Set<string>;
        updatePosition: (x: number, y: number, skipIds?: Set<string>) => void;
      }
    >()
  );

  const handlePositionChange = (id: string, x: number, y: number) => {
    setPieces((prev) =>
      prev.map((piece) => (piece.id === id ? { ...piece, x, y } : piece))
    );
    console.log(`Piece ${id} moved to:`, { x, y });
  };

  const handleTextChange = (id: string, text: string) => {
    setPieces((prev) =>
      prev.map((piece) => (piece.id === id ? { ...piece, text } : piece))
    );
    console.log(`Piece ${id} text updated:`, text);
  };

  const handleConnect = (piece1Id: string, piece2Id: string, side: string) => {
    console.log(`Piece ${piece1Id} connected to ${piece2Id} on ${side} side`);
  };

  const handleDelete = (id: string) => {
    setPieces((prev) => prev.filter((piece) => piece.id !== id));
    console.log(`Piece ${id} deleted`);
  };

  const handleDuplicate = (id: string) => {
    const pieceToDuplicate = pieces.find((piece) => piece.id === id);
    if (pieceToDuplicate) {
      const newPiece = {
        ...pieceToDuplicate,
        id: `piece${Date.now()}`,
        x: pieceToDuplicate.x + 150,
        y: pieceToDuplicate.y + 150,
      };
      setPieces((prev) => [...prev, newPiece]);
      console.log(`Piece ${id} duplicated as ${newPiece.id}`);
    }
  };

  return (
    <RoomLayout>
      <InfiniteCanvas>
        {pieces.map((piece) => (
          <PuzzlePiece
            key={piece.id}
            id={piece.id}
            initialX={piece.x}
            initialY={piece.y}
            color={piece.color}
            text={piece.text}
            onPositionChange={handlePositionChange}
            onTextChange={handleTextChange}
            onConnect={handleConnect}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            allPieces={allPiecesRef.current}
          />
        ))}
      </InfiniteCanvas>
    </RoomLayout>
  );
}

export default Page;

"use client";

import { useState, useRef, useEffect } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

type PuzzlePieceProps = {
  id: string;
  color?: string;
  text?: string;
  onTextChange?: (id: string, text: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
};

const PIECE_SIZE = 120;

export function PuzzlePiece({
  id,
  color = "#bacded",
  text = "",
  onTextChange,
  onDelete,
  onDuplicate,
}: PuzzlePieceProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [pieceText, setPieceText] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleTextSave = () => {
    setIsEditing(false);
    onTextChange?.(id, pieceText);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          style={{
            width: PIECE_SIZE,
            height: PIECE_SIZE,
          }}
          className="relative select-none"
        >
          {/* Puzzle Piece SVG Shape */}
          <svg
            width={PIECE_SIZE}
            height={PIECE_SIZE}
            viewBox="0 0 120 120"
            className="absolute inset-0 drop-shadow-lg"
          >
            <path
              d="M 10 10 
                 L 50 10 
                 Q 55 5, 60 10 
                 Q 65 15, 60 20 
                 Q 55 25, 50 20 
                 L 10 20 
                 L 10 50 
                 Q 5 55, 10 60 
                 Q 15 65, 20 60 
                 Q 25 55, 20 50 
                 L 20 10 
                 Z
                 
                 M 60 10
                 L 110 10
                 L 110 60
                 Q 115 65, 110 70
                 Q 105 75, 100 70
                 Q 95 65, 100 60
                 L 100 10
                 Z
                 
                 M 10 60
                 L 10 110
                 L 60 110
                 Q 65 115, 70 110
                 Q 75 105, 70 100
                 Q 65 95, 60 100
                 L 10 100
                 Z
                 
                 M 60 60
                 L 110 60
                 L 110 110
                 L 60 110
                 Z"
              fill={color}
              stroke="#2d3748"
              strokeWidth="2"
              className="transition-colors hover:brightness-105"
            />
          </svg>

          {/* Text content area */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="w-full h-full flex items-center justify-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (!isEditing) setIsEditing(true);
              }}
            >
              {isEditing ? (
                <textarea
                  ref={textareaRef}
                  value={pieceText}
                  onChange={(e) => setPieceText(e.target.value)}
                  onBlur={handleTextSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleTextSave();
                    }
                    if (e.key === "Escape") {
                      setPieceText(text);
                      setIsEditing(false);
                    }
                  }}
                  className="w-full h-16 bg-transparent text-center text-xs font-medium resize-none outline-none border-none focus:ring-0"
                  style={{ color: "#2d3748" }}
                  maxLength={50}
                  placeholder="Click to add text..."
                />
              ) : (
                <p className="text-xs font-medium text-gray-800 text-center break-words w-full px-4">
                  {pieceText || "Click to edit"}
                </p>
              )}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => setIsEditing(true)}>
          Edit Text
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onDuplicate?.(id)}>
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onDelete?.(id)} variant="destructive">
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

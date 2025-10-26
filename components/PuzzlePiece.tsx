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
  isBeingEditedBy?: string | null;
};

const PIECE_SIZE = 120;

export function PuzzlePiece({
  id,
  color = "#bacded",
  text = "",
  onTextChange,
  onDelete,
  onDuplicate,
  isBeingEditedBy = null,
}: PuzzlePieceProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [pieceText, setPieceText] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setPieceText(text);
    }
  }, [text, isEditing]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleTextChange = (newText: string) => {
    setPieceText(newText);
    onTextChange?.(id, newText);
  };

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
            backgroundColor: color,
          }}
          className={`relative select-none rounded-2xl border-2 shadow-lg transition-all hover:brightness-105 hover:shadow-xl ${
            isBeingEditedBy ? "border-blue-500 border-4" : "border-gray-800"
          }`}
        >
          {/* Editing indicator */}
          {isBeingEditedBy && !isEditing && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap z-10">
              Someone is editing...
            </div>
          )}

          {/* Text content area */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="w-full h-full flex items-center justify-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (!isEditing && !isBeingEditedBy) setIsEditing(true);
              }}
            >
              {isEditing ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <textarea
                    ref={textareaRef}
                    value={pieceText}
                    onChange={(e) => handleTextChange(e.target.value)}
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
                    className="w-full flex-1 bg-transparent text-center text-xs font-medium resize-none outline-none border-none focus:ring-0"
                    style={{ color: "#2d3748" }}
                    maxLength={50}
                    placeholder="Click to add text..."
                  />
                  <div
                    className={`text-[10px] font-medium mt-1 ${
                      pieceText.length >= 50
                        ? "text-red-600"
                        : pieceText.length >= 40
                        ? "text-orange-600"
                        : "text-gray-500"
                    }`}
                  >
                    {pieceText.length}/50
                  </div>
                </div>
              ) : (
                <p className="text-xs font-medium text-gray-800 text-center break-words w-full px-2">
                  {pieceText || "Click to edit"}
                </p>
              )}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => setIsEditing(true)}
          disabled={!!isBeingEditedBy}
        >
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

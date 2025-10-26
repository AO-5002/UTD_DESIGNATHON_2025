import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "",
});

type PieceData = {
  id: string;
  color: string;
  text: string;
  type?: "regular" | "consolidated";
  gridPositions?: { row: number; col: number }[]; // For consolidated pieces - positions they occupy
  sourceIds?: string[]; // IDs of pieces that were merged
};

type SoundEvent = {
  id: string;
  soundUrl: string;
  timestamp: number;
};

type Storage = {
  pieces: PieceData[];
  soundEvents: SoundEvent[];
};

type Presence = {
  // Add your presence types here
};

export const {
  RoomProvider,
  useStorage,
  useMutation,
  useOthers,
  useSelf,
  useRoom,
} = createRoomContext<Presence, Storage>(client);

"use client";
import { Children } from "@/util/types/Children";
import Navbar from "@/components/Navbar";
import { DockItemData } from "@/components/Dock";
import { MenuClickBtn, type SoundBlock } from "@/components/MenuClickBtn";
import {
  Settings,
  Bell,
  Search,
  Music,
  Smile,
  Zap,
  Star,
  Heart,
  Sparkles,
  Laugh,
  PartyPopper,
  Volume2,
  MousePointer2,
  Lightbulb,
  Type,
  MessageSquarePlus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
};

function SidebarItem({ icon, label, onClick, isActive }: SidebarItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-br from-[#FFB5B5] to-[#FFCACA] text-[#FF8B8B] shadow-md"
            : "hover:bg-gray-100 text-gray-700 hover:text-black"
        }`}
      >
        {icon}
      </button>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-fit whitespace-nowrap rounded-md border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm text-black shadow-lg z-50"
            role="tooltip"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Sidebar() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Sound blocks using your local WAV files (1-7)
  const goofySoundBlocks: SoundBlock[] = [
    {
      id: "1",
      label: "Sound 1",
      sound: "/sounds/1.wav",
      color: "#bacded",
      icon: <Smile size={16} />,
    },
    {
      id: "2",
      label: "Sound 2",
      sound: "/sounds/2.wav",
      color: "#f7bbdc",
      icon: <Star size={16} />,
    },
    {
      id: "3",
      label: "Sound 3",
      sound: "/sounds/3.wav",
      color: "#ddedab",
      icon: <Zap size={16} />,
    },
    {
      id: "4",
      label: "Sound 4",
      sound: "/sounds/4.wav",
      color: "#ffd7d7",
      icon: <Sparkles size={16} />,
    },
    {
      id: "5",
      label: "Sound 5",
      sound: "/sounds/5.wav",
      color: "#f6db70",
      icon: <Heart size={16} />,
    },
    {
      id: "6",
      label: "Sound 6",
      sound: "/sounds/6.wav",
      color: "#bacded",
      icon: <Laugh size={16} />,
    },
    {
      id: "7",
      label: "Sound 7",
      sound: "/sounds/7.wav",
      color: "#f7bbdc",
      icon: <Volume2 size={16} />,
    },
    {
      id: "8",
      label: "Empty",
      sound: "/sounds/1.wav", // Placeholder - reuses sound 1
      color: "#ddedab",
      icon: <PartyPopper size={16} />,
    },
    {
      id: "9",
      label: "Empty",
      sound: "/sounds/1.wav", // Placeholder - reuses sound 1
      color: "#ffd7d7",
      icon: <Music size={16} />,
    },
  ];

  const sidebarItems = [
    {
      icon: <MousePointer2 size={22} />,
      label: "Select",
      onClick: () => {
        console.log("Home clicked");
        setActiveIndex(0);
      },
    },
    {
      icon: <Lightbulb size={22} />,
      label: "Consolidate Ideas",
      onClick: () => {
        console.log("Team clicked");
        setActiveIndex(1);
      },
    },
    {
      icon: <Type size={22} />,
      label: "",
      onClick: () => {
        console.log("Notifications clicked");
        setActiveIndex(2);
      },
    },
    {
      icon: <MessageSquarePlus size={22} />,
      label: "Search",
      onClick: () => {
        console.log("Search clicked");
        setActiveIndex(3);
      },
    },
  ];

  return (
    <aside className="fixed top-1/2 left-12 -translate-y-1/2 w-16 bg-white rounded-2xl border-2 border-[var(--color-border)] shadow-lg p-2 z-50">
      <div className="flex flex-col gap-1">
        {/* Regular sidebar items */}
        {sidebarItems.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            isActive={activeIndex === index}
          />
        ))}

        {/* Divider */}
        <div className="h-px bg-gray-200 my-1" />

        {/* MenuClickBtn with sound blocks */}
        <MenuClickBtn
          icon={<Music size={22} />}
          label="Goofy Sounds"
          soundBlocks={goofySoundBlocks}
        />

        {/* Settings at the bottom */}
        <SidebarItem
          icon={<Settings size={22} />}
          label="Settings"
          onClick={() => {
            console.log("Settings clicked");
            setActiveIndex(4);
          }}
          isActive={activeIndex === 4}
        />
      </div>
    </aside>
  );
}

type RoomLayoutProps = Children & {
  navbarItems?: DockItemData[];
};

function RoomLayout({ children, navbarItems }: RoomLayoutProps) {
  return (
    <div className="relative min-h-screen w-full">
      {/* Navbar (Dock) - Fixed at the top, overlaying content */}
      <Navbar items={navbarItems} />

      {/* Sidebar - Fixed position, vertically centered, overlaying content */}
      <Sidebar />

      {/* Main content - Full screen, navbar and sidebar overlay on top */}
      <main className="w-full h-screen">{children}</main>
    </div>
  );
}

export default RoomLayout;

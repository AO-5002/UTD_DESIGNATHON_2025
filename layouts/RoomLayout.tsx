"use client";
import { Children } from "@/util/types/Children";
import Navbar from "@/components/Navbar";
import {
  Home,
  Users,
  Settings,
  Bell,
  Search,
  MousePointer2,
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

  const sidebarItems = [
    {
      icon: <Home size={22} />,
      label: "Home",
      onClick: () => {
        console.log("Home clicked");
        setActiveIndex(0);
      },
    },
    {
      icon: <Users size={22} />,
      label: "Team",
      onClick: () => {
        console.log("Team clicked");
        setActiveIndex(1);
      },
    },
    {
      icon: <Bell size={22} />,
      label: "Notifications",
      onClick: () => {
        console.log("Notifications clicked");
        setActiveIndex(2);
      },
    },
    {
      icon: <Search size={22} />,
      label: "Search",
      onClick: () => {
        console.log("Search clicked");
        setActiveIndex(3);
      },
    },
    {
      icon: <Settings size={22} />,
      label: "Settings",
      onClick: () => {
        console.log("Settings clicked");
        setActiveIndex(4);
      },
    },
  ];

  return (
    <aside className="fixed top-1/2 left-12 -translate-y-1/2 w-16 bg-white rounded-2xl border-2 border-[var(--color-border)] shadow-lg p-2 z-50">
      <div className="flex flex-col gap-1">
        {sidebarItems.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            isActive={activeIndex === index}
          />
        ))}
      </div>
    </aside>
  );
}

function RoomLayout({ children }: Children) {
  return (
    <div className="relative min-h-screen w-full">
      {/* Navbar (Dock) - Fixed at the top, overlaying content */}
      <Navbar />

      {/* Sidebar - Fixed position, vertically centered, overlaying content */}
      <Sidebar />

      {/* Main content - Full screen, navbar and sidebar overlay on top */}
      <main className="w-full h-screen">{children}</main>
    </div>
  );
}

export default RoomLayout;

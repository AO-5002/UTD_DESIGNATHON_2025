import { Children } from "@/util/types/Children";
import Navbar from "@/components/Navbar";

function RoomLayout({ children }: Children) {
  return (
    <>
      {/* Navbar (Dock) - Now fixed at the top of the page */}
      <Navbar />

      {/* Main content area with sidebar */}
      <div className="col-start-2 col-span-10 flex flex-1 gap-6 mt-20">
        {/* Sidebar */}
        <aside className="w-24 bg-white rounded-2xl border-2 border-[var(--color-border)] shadow-lg p-4">
          {/* Add your sidebar content here */}
        </aside>

        {/* Main content */}
        <main className="flex-1 rounded-2xl border-2 border-[var(--color-border)] p-6">
          {children}
        </main>
      </div>
    </>
  );
}

export default RoomLayout;

import { Children } from "@/util/types/Children";

export function PageLayout({ children }: Children) {
  return (
    <main className="w-full min-h-screen bg-(--color-primary) grid grid-cols-12 gap-6 p-8">
      <div className="col-start-2 col-span-10">{children}</div>
    </main>
  );
}

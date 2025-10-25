import { Children } from "@/util/types/Children";
import { Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "./PageLayout";

function Nav() {
  return (
    <div className="w-full h-12 flex flex-row items-center justify-between border">
      <Puzzle />
      <Button className="py-2 px-8 bg-(--color-primary-900) text-white">
        Sign Up
      </Button>
    </div>
  );
}

function LandingLayout({ children }: Children) {
  return (
    <PageLayout>
      <div className="col-start-2 col-span-10">
        <Nav />
        {children}
      </div>
    </PageLayout>
  );
}

export default LandingLayout;

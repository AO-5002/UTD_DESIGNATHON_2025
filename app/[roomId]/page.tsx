import { PageLayout } from "@/layouts/PageLayout";
import RoomLayout from "@/layouts/RoomLayout";
import React from "react";
import InfiniteCanvas from "./infinite-canvas";

function page() {
  return (
    <PageLayout>
      <RoomLayout>
        <InfiniteCanvas />
      </RoomLayout>
    </PageLayout>
  );
}

export default page;

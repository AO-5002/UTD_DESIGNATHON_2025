import { PageLayout } from "@/layouts/PageLayout";
import RoomLayout from "@/layouts/RoomLayout";
import React from "react";

function page() {
  return (
    <PageLayout>
      <RoomLayout>
        <h1>hi</h1>
      </RoomLayout>
    </PageLayout>
  );
}

export default page;

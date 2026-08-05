import { Suspense } from "react";
import IndentRequestPage from "@/components/indent-request/IndentRequestPage";

export default function IndentRequestRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IndentRequestPage />
    </Suspense>
  );
}

import { Suspense } from "react";
import BillingPage from "@/components/billing/BillingPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BillingPage />
    </Suspense>
  );
}

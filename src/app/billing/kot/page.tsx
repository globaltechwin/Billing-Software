import { Suspense } from "react";
import BillingTableView from "@/components/billing/kot/BillingPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Loading table view...</div>}>
      <BillingTableView />
    </Suspense>
  );
}

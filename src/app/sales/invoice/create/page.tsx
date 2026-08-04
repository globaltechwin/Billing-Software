import { Suspense } from "react";
import InvoicePage from "@/components/invoice/InvoicePage";

export default function CreateInvoicePage() {
  return (
    <Suspense>
      <InvoicePage />
    </Suspense>
  );
}

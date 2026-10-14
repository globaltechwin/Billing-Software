"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InvoicePrintPreview from "@/components/billing/InvoicePrintPreview";

export default function InvoicePrintPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const invoiceId = Number(params.id);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
      router.replace("/sales/invoice");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValid(true);
  }, [invoiceId, router]);

  if (!valid) return <div className="p-8 text-sm text-gray-600">Loading invoice receipt…</div>;
  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <InvoicePrintPreview invoiceId={invoiceId} onClose={() => router.push("/sales/invoice")} />
    </div>
  );
}

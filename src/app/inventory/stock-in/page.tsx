import { Suspense } from "react";
import StockInPage from "@/components/stock-in/StockInPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StockInPage />
    </Suspense>
  );
}

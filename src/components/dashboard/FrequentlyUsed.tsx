import { Factory, ShoppingCart, Wallet } from "lucide-react";
import FrequentlyUsedCard from "./FrequentlyUsedCard";

const CARDS = [
  { label: "Prod. Planning", icon: Factory, color: "orange" as const },
  { label: "Prod. Planning List", icon: Factory, color: "orange" as const },
  { label: "Production-In", icon: Factory, color: "orange" as const },
  { label: "Estimate", icon: ShoppingCart, color: "green" as const },
  { label: "Invoice", icon: ShoppingCart, color: "green" as const },
  { label: "Cash Dashboard", icon: Wallet, color: "blue" as const },
];

export default function FrequentlyUsed() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Frequently Used
        </h2>
        <span className="text-xs text-gray-400">
          Usage is tracked in your browser
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CARDS.map((card) => (
          <FrequentlyUsedCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}

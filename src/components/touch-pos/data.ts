export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  color: string;
}

export interface CartItem {
  id: number;
  product: Product;
  qty: number;
}

export const CATEGORIES = [
  { id: "all", name: "All", color: "bg-gray-500" },
  { id: "food", name: "Food", color: "bg-green-500" },
  { id: "drinks", name: "Drinks", color: "bg-blue-500" },
  { id: "grocery", name: "Grocery", color: "bg-purple-500" },
  { id: "other", name: "Other", color: "bg-orange-500" },
] as const;

export const PRODUCTS: Product[] = [
  { id: 1, name: "Shirt Wash", price: 50, category: "food", color: "bg-amber-100" },
  { id: 2, name: "Pant Iron", price: 30, category: "food", color: "bg-green-100" },
  { id: 3, name: "Suit Dry Clean", price: 200, category: "food", color: "bg-blue-100" },
  { id: 4, name: "Saree Wash", price: 150, category: "drinks", color: "bg-pink-100" },
  { id: 5, name: "Bed Sheet Wash", price: 80, category: "drinks", color: "bg-yellow-100" },
  { id: 6, name: "Towel Wash", price: 25, category: "grocery", color: "bg-purple-100" },
  { id: 7, name: "Jacket Clean", price: 180, category: "grocery", color: "bg-red-100" },
  { id: 8, name: "Blanket Wash", price: 120, category: "other", color: "bg-teal-100" },
  { id: 9, name: "Curtain Wash", price: 90, category: "other", color: "bg-indigo-100" },
  { id: 10, name: "Shoe Clean", price: 60, category: "food", color: "bg-orange-100" },
  { id: 11, name: "Bag Clean", price: 70, category: "drinks", color: "bg-cyan-100" },
  { id: 12, name: "Cap Wash", price: 20, category: "grocery", color: "bg-lime-100" },
];
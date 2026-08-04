import AppShell from "@/components/layout/AppShell";

export default function CashFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

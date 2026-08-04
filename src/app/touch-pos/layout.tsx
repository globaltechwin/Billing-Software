import AppShell from "@/components/layout/AppShell";

export default function TouchPosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

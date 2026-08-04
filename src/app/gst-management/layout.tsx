import AppShell from "@/components/layout/AppShell";

export default function GSTManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

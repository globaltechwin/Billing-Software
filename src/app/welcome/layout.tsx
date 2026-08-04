import AppShell from "@/components/layout/AppShell";

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

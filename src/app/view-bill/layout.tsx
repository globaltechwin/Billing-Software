import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function ViewBillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <div className="ml-[72px]">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
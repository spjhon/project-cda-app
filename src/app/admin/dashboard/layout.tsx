

export default function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
  
    <main className="bg-[#F5F5F5]">
    {children}
    </main>
  );
}

import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import type { User } from "@shared/schema";
import Footer from "@/components/layout/footer";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { user } = useAuth();
  const typedUser = user as User | null;

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />

        <main className="flex-1 overflow-auto">
          <div className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 max-w-full"> 
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
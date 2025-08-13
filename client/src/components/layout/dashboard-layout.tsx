import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import type { User } from "@shared/schema";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { user } = useAuth();
  const typedUser = user as User | null;

  return (
    <div className="flex h-screen bg-oa-black">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <Header />

        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
              {subtitle && (
                <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">{subtitle}</p>
              )}
            </div>

            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
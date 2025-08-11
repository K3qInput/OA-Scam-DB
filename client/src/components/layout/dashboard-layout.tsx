import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
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
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <div className="h-screen overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-full">
            {/* Page Header */}
            {(title || subtitle) && (
              <div className="mb-6">
                {title && (
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-gray-400 text-lg">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            
            {/* Page Content */}
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
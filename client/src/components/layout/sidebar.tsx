import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Plus, 
  Users, 
  Settings, 
  Mail,
  MessageSquare,
  UserCheck,
  Gavel,
  Zap,
  Briefcase,
  ThumbsUp,
  AlertTriangle,
  Shield,
  BarChart,
  FileText,
  Star,
  ShoppingCart,
  Calendar,
  BookOpen,
  Brain,
  Wrench,
  MapPin,
  Activity, // Added for Live Activity Feed
  Award // Added for Proof of Ownership
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@shared/schema";

interface SidebarProps {
  className?: string;
}

function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const typedUser = user as User | null;

  const isActive = (href: string) => location === href;

  const linkClass = (href: string) => cn(
    "flex items-center gap-3 px-2 lg:px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
    isActive(href) 
      ? "bg-red-500 text-white shadow-lg" 
      : "text-gray-300 hover:bg-gray-800 hover:text-white"
  );

  // Helper for rendering sidebar links, to avoid repetition
  const SidebarLink = ({ href, icon, text }: { href: string; icon: React.ReactNode; text: string }) => (
    <Link href={href} className={linkClass(href)}>
      {icon}
      <span className="hidden lg:inline">{text}</span>
    </Link>
  );

  return (
    <aside className={cn("bg-gray-900 border-r border-gray-700 w-16 lg:w-60 min-h-screen flex flex-col overflow-y-auto", className)}>
      {/* Header */}
      <div className="p-2 lg:p-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold text-white">OwnersAlliance</h1>
            <p className="text-xs text-gray-400">Admin Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2">
          {/* Core Navigation */}
          <div className="space-y-1">
            <SidebarLink href="/dashboard" icon={<Home className="w-4 h-4" />} text="Dashboard" />
            <SidebarLink href="/new-case" icon={<Plus className="w-4 h-4" />} text="New Case" />
            <SidebarLink href="/profile" icon={<Users className="w-4 h-4" />} text="Profile" />
          </div>

          {/* Admin Panel */}
          {typedUser && typedUser.role === "admin" && (
            <div className="pt-4">
              <h3 className="hidden lg:block px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Administration
              </h3>
              <div className="space-y-1">
                <SidebarLink href="/admin" icon={<Settings className="w-4 h-4" />} text="Admin Panel" />
                <SidebarLink href="/custom-roles" icon={<Shield className="w-4 h-4" />} text="Role Builder" />
                <SidebarLink href="/live-activity-feed" icon={<Activity className="w-4 h-4" />} text="Live Activity" />
                <SidebarLink href="/admin-moderation" icon={<Shield className="w-4 h-4" />} text="Moderation Center" />
              </div>
            </div>
          )}

          {/* Case Management */}
          <div className="pt-4">
            <h3 className="hidden lg:block px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Cases & Reports
            </h3>
            <div className="space-y-1">
              <SidebarLink href="/alt-detection" icon={<AlertTriangle className="w-4 h-4" />} text="Alt Detection" />
              <SidebarLink href="/disputes" icon={<Gavel className="w-4 h-4" />} text="Disputes" />
              <SidebarLink href="/report-vault" icon={<FileText className="w-4 h-4" />} text="Report Vault" />
            </div>
          </div>

          {/* Security & Trust */}
          <div className="pt-4">
            <h3 className="hidden lg:block px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Security & Trust
            </h3>
            <div className="space-y-1">
              <SidebarLink href="/reputation-insurance" icon={<Shield className="w-4 h-4" />} text="Rep Insurance" />
              <SidebarLink href="/impersonation-heatmap" icon={<MapPin className="w-4 h-4" />} text="Impersonation Map" />
              <SidebarLink href="/proof-of-ownership" icon={<Award className="w-4 h-4" />} text="Proof of Ownership" />
              <SidebarLink href="/member-verification" icon={<UserCheck className="w-4 h-4" />} text="Verification" />
            </div>
          </div>

          {/* Staff Management */}
          {typedUser && typedUser.role && ["admin", "tribunal_head", "senior_staff"].includes(typedUser.role) && (
            <div className="pt-4">
              <h3 className="hidden lg:block px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Staff Management
              </h3>
              <div className="space-y-1">
                <SidebarLink href="/staff-management" icon={<Users className="w-4 h-4" />} text="Staff Members" />
                <SidebarLink href="/staff-assignments" icon={<UserCheck className="w-4 h-4" />} text="Assignments" />
                <SidebarLink href="/tribunal-proceedings" icon={<Gavel className="w-4 h-4" />} text="Tribunal" />
              </div>
            </div>
          )}

          {/* Community */}
          <div className="pt-4">
            <h3 className="hidden lg:block px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Community
            </h3>
            <div className="space-y-1">
              <SidebarLink href="/vouches" icon={<ThumbsUp className="w-4 h-4" />} text="Vouches" />
              <SidebarLink href="/marketplace" icon={<ShoppingCart className="w-4 h-4" />} text="Marketplace" />
              <SidebarLink href="/ai-tools" icon={<Brain className="w-4 h-4" />} text="AI Tools" />
            </div>
          </div>

          {/* Tools & Settings */}
          <div className="pt-4">
            <h3 className="hidden lg:block px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Settings
            </h3>
            <div className="space-y-1">
              <SidebarLink href="/settings" icon={<Settings className="w-4 h-4" />} text="Settings" />
              <SidebarLink href="/contact" icon={<Mail className="w-4 h-4" />} text="Contact" />
            </div>
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-2 border-t border-gray-700">
        <div className="text-center text-xs text-gray-500">
          <div className="hidden lg:block space-y-1">
            <p className="font-medium">OwnersAlliance</p>
            <p>© 2025 All Rights Reserved</p>
          </div>
          <div className="lg:hidden">
            <p>©2025</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
export { Sidebar };
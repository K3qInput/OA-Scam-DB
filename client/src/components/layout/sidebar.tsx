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
  Award, // Added for Proof of Ownership
  User, // Added for User profile link
  BarChart3,
  Scale,
  FileCheck,
  ShoppingBag,
  PlayCircle,
  UserCog
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
        <nav className="flex-1 space-y-1">
          <SidebarLink href="/dashboard" icon={<BarChart3 className="w-5 h-5" />} text="Dashboard" />
          <SidebarLink href="/new-case" icon={<FileText className="w-5 h-5" />} text="New Case" />
          <SidebarLink href="/alt-detection" icon={<Users className="w-5 h-5" />} text="Alt Detection" />
          <SidebarLink href="/disputes" icon={<Scale className="w-5 h-5" />} text="Disputes" />

          {/* Trust & Security */}
          <div className="pt-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 lg:px-4">
              Trust & Security
            </p>
          </div>
          <SidebarLink href="/reputation-profiles" icon={<Shield className="w-5 h-5" />} text="Trust Scores" />
          <SidebarLink href="/impersonation-heatmap" icon={<AlertTriangle className="w-5 h-5" />} text="Impersonation" />
          <SidebarLink href="/reputation-insurance" icon={<FileCheck className="w-5 h-5" />} text="Insurance" />
          <SidebarLink href="/proof-of-ownership" icon={<Award className="w-5 h-5" />} text="Ownership Verification" />

          {/* Community Features */}
          <div className="pt-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 lg:px-4">
              Community
            </p>
          </div>
          <SidebarLink href="/marketplace" icon={<ShoppingBag className="w-5 h-5" />} text="Marketplace" />
          <SidebarLink href="/tribunal-proceedings" icon={<Gavel className="w-5 h-5" />} text="Tribunal" />
          <SidebarLink href="/community-events" icon={<Calendar className="w-5 h-5" />} text="Events" />

          {(typedUser?.role === 'admin' || typedUser?.role === 'super_admin') && (
            <>
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 lg:px-4">
                  Admin Tools
                </p>
              </div>
              <SidebarLink href="/admin-panel" icon={<Settings className="w-5 h-5" />} text="Admin Panel" />
              <SidebarLink href="/action-playbooks" icon={<PlayCircle className="w-5 h-5" />} text="Action Playbooks" />
              <SidebarLink href="/ai-moderation-controls" icon={<Brain className="w-5 h-5" />} text="AI Controls" />
              <SidebarLink href="/custom-roles" icon={<UserCog className="w-5 h-5" />} text="Role Builder" />
              <SidebarLink href="/admin-moderation" icon={<UserCheck className="w-5 h-5" />} text="Moderation" />
            </>
          )}
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
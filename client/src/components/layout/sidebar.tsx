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
    <aside className={cn("bg-gray-900 border-r border-gray-700 w-16 lg:w-64 min-h-screen flex flex-col", className)}>
      {/* Header */}
      <div className="p-3 lg:p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold text-white">OwnersAlliance</h1>
            <p className="text-sm text-gray-400">Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {/* Core Navigation */}
          <SidebarLink href="/dashboard" icon={<Home className="w-5 h-5" />} text="Dashboard" />
          <SidebarLink href="/new-case" icon={<Plus className="w-5 h-5" />} text="New Case" />
          <SidebarLink href="/profile" icon={<Users className="w-5 h-5" />} text="Profile" />
          <SidebarLink href="/settings" icon={<Settings className="w-5 h-5" />} text="Settings" />

          {/* Tools & Services */}
          <div className="pt-6">
            <h3 className="hidden lg:block px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Tools & Services
            </h3>
            <SidebarLink href="/ai-tools" icon={<Zap className="w-5 h-5" />} text="AI Tools" />
            <SidebarLink href="/marketplace" icon={<Briefcase className="w-5 h-5" />} text="Freelancer Marketplace" />
          </div>

          {/* Contact & Support */}
          <div className="pt-6">
            <h3 className="hidden lg:block px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Contact & Support
            </h3>
            <SidebarLink href="/contact" icon={<Mail className="w-5 h-5" />} text="Contact Us" />

            {typedUser && typedUser.role && ["admin", "tribunal_head", "senior_staff", "staff"].includes(typedUser.role) && (
              <SidebarLink href="/contact-management" icon={<MessageSquare className="w-5 h-5" />} text="Manage Contacts" />
            )}
          </div>

          {/* Staff Management */}
          {typedUser && typedUser.role && ["admin", "tribunal_head", "senior_staff"].includes(typedUser.role) && (
            <div className="pt-6">
              <h3 className="hidden lg:block px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Staff Management
              </h3>
              <SidebarLink href="/staff-management" icon={<Users className="w-5 h-5" />} text="Staff Members" />
              <SidebarLink href="/staff-assignments" icon={<UserCheck className="w-5 h-5" />} text="Assignments" />
            </div>
          )}

          {/* Tribunal Operations */}
          {typedUser && typedUser.role && ["admin", "tribunal_head"].includes(typedUser.role) && (
            <div className="pt-6">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Tribunal Operations
              </h3>
              <SidebarLink href="/tribunal-proceedings" icon={<Gavel className="w-5 h-5" />} text="Proceedings" />
            </div>
          )}

          {/* Community */}
          <div className="pt-6">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Community
            </h3>
            <SidebarLink href="/vouches" icon={<UserCheck className="w-5 h-5" />} text="Vouches" />
            <SidebarLink href="/vouch-system" icon={<ThumbsUp className="w-5 h-5" />} text="Vouch System" />
            <SidebarLink href="/disputes" icon={<Gavel className="w-5 h-5" />} text="Disputes" />
            <SidebarLink href="/alt-detection" icon={<AlertTriangle className="w-5 h-5" />} text="Alt Detection" />
          </div>

          {/* Trust & Security */}
          <div className="pt-6">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Trust & Security
            </h3>
            <SidebarLink href="/member-verification" icon={<Shield className="w-5 h-5" />} text="Member Verification" />
            <SidebarLink href="/reputation-profiles" icon={<Star className="w-5 h-5" />} text="Reputation Profiles" />
            <SidebarLink href="/report-vault" icon={<AlertTriangle className="w-5 h-5" />} text="Report Vault" />
            <SidebarLink href="/blacklist-database" icon={<Shield className="w-5 h-5" />} text="Blacklist Database" />
            <SidebarLink href="/staff-transparency" icon={<Users className="w-5 h-5" />} text="Staff Transparency" />
            <SidebarLink href="/threat-intel" icon={<Shield className="w-5 h-5" />} text="Threat Intelligence" />
            <SidebarLink href="/reputation-insurance" icon={<Shield className="w-5 h-5" />} text="Reputation Insurance" />
            <SidebarLink href="/impersonation-heatmap" icon={<MapPin className="w-5 h-5" />} text="Impersonation Map" />
            <SidebarLink href="/proof-of-ownership" icon={<Shield className="w-5 h-5" />} text="Proof of Ownership" />

            {typedUser && typedUser.role && ["admin", "tribunal_head", "senior_staff"].includes(typedUser.role) && (
              <SidebarLink href="/security-dashboard" icon={<Shield className="w-5 h-5" />} text="Security Dashboard" />
            )}
          </div>

          {/* Collaboration & Networking */}
          <div className="pt-6">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Collaboration & Networking
            </h3>
            <SidebarLink href="/marketplace" icon={<ShoppingCart className="w-5 h-5" />} text="Project Marketplace" />
            <SidebarLink href="/community-events" icon={<Calendar className="w-5 h-5" />} text="Community Events" />
          </div>

          {/* Server Owner Utilities */}
          <div className="pt-6">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Server Owner Utilities
            </h3>
            <SidebarLink href="/resource-hub" icon={<BookOpen className="w-5 h-5" />} text="Resource Hub" />
            <SidebarLink href="/utilities" icon={<Wrench className="w-5 h-5" />} text="Utilities" />
          </div>

          {/* AI & Automation */}
          <div className="pt-6">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              AI & Automation
            </h3>
            <SidebarLink href="/ai-tools" icon={<Brain className="w-5 h-5" />} text="AI Tools" />
          </div>

          {/* Admin Only */}
          {typedUser && typedUser.role && typedUser.role === "admin" && (
            <>
              <div className="pt-6">
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Administration
                </h3>
                <SidebarLink href="/admin" icon={<Settings className="w-5 h-5" />} text="Admin Panel" />
              </div>

              <div className="pt-6">
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  World's Best Moderation
                </h3>
                <SidebarLink href="/admin-moderation" icon={<Shield className="w-5 h-5" />} text="Staff Moderation Center" />
                <SidebarLink href="/content-management" icon={<FileText className="w-5 h-5" />} text="Content Management" />
                <SidebarLink href="/advanced-analytics" icon={<BarChart className="w-5 h-5" />} text="Advanced Analytics" />
              </div>
            </>
          )}
          
          {/* New Features - Custom Role Builder Admin Feature & Live Activity Feed */}
          {typedUser && typedUser.role && typedUser.role === "admin" && (
            <div className="pt-6">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Advanced Features
              </h3>
              <div className="space-y-1">
                <SidebarLink 
                  href="/custom-roles" 
                  icon={<Settings className="w-5 h-5" />}
                  text="Custom Roles"
                />
                <SidebarLink 
                  href="/live-activity-feed" 
                  icon={<Activity className="w-5 h-5" />}
                  text="Live Activity Feed"
                />
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Footer */}
      <div className="mt-auto p-3 lg:p-6 border-t border-gray-700">
        <div className="text-center text-xs text-gray-500">
          <div className="hidden lg:block">
            <p>Made by Kiro.java</p>
            <p>"I was too lazy 💀"</p>
            <p>Copyright 2025</p>
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
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
  Shield
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
    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
    isActive(href) 
      ? "bg-red-500 text-white shadow-lg" 
      : "text-gray-300 hover:bg-gray-800 hover:text-white"
  );

  return (
    <aside className={cn("bg-gray-900 border-r border-gray-700 w-64 min-h-screen flex flex-col", className)}>
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">OwnersAlliance</h1>
            <p className="text-sm text-gray-400">Portal</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-2">
          {/* Core Navigation */}
          <Link href="/dashboard" className={linkClass("/dashboard")}>
            <Home className="w-5 h-5" />
            Dashboard
          </Link>
          
          <Link href="/new-case" className={linkClass("/new-case")}>
            <Plus className="w-5 h-5" />
            New Case
          </Link>

          {/* Tools & Services */}
          <div className="pt-6">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Tools & Services
            </h3>
            <Link href="/ai-tools" className={linkClass("/ai-tools")}>
              <Zap className="w-5 h-5" />
              AI Tools
            </Link>
            
            <Link href="/marketplace" className={linkClass("/marketplace")}>
              <Briefcase className="w-5 h-5" />
              Freelancer Marketplace
            </Link>
          </div>

          {/* Contact & Support */}
          <div className="pt-6">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Contact & Support
            </h3>
            <Link href="/contact" className={linkClass("/contact")}>
              <Mail className="w-5 h-5" />
              Contact Us
            </Link>
            
            {typedUser && typedUser.role && ["admin", "tribunal_head", "senior_staff", "staff"].includes(typedUser.role) && (
              <Link href="/contact-management" className={linkClass("/contact-management")}>
                <MessageSquare className="w-5 h-5" />
                Manage Contacts
              </Link>
            )}
          </div>

          {/* Staff Management */}
          {typedUser && typedUser.role && ["admin", "tribunal_head", "senior_staff"].includes(typedUser.role) && (
            <div className="pt-6">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Staff Management
              </h3>
              <Link href="/staff-management" className={linkClass("/staff-management")}>
                <Users className="w-5 h-5" />
                Staff Members
              </Link>
              
              <Link href="/staff-assignments" className={linkClass("/staff-assignments")}>
                <UserCheck className="w-5 h-5" />
                Assignments
              </Link>
            </div>
          )}

          {/* Tribunal Operations */}
          {typedUser && typedUser.role && ["admin", "tribunal_head"].includes(typedUser.role) && (
            <div className="pt-6">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Tribunal Operations
              </h3>
              <Link href="/tribunal-proceedings" className={linkClass("/tribunal-proceedings")}>
                <Gavel className="w-5 h-5" />
                Proceedings
              </Link>
            </div>
          )}

          {/* Community */}
          <div className="pt-6">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Community
            </h3>
            <Link href="/vouches" className={linkClass("/vouches")}>
              <UserCheck className="w-5 h-5" />
              Vouches
            </Link>
            
            <Link href="/vouch-system" className={linkClass("/vouch-system")}>
              <ThumbsUp className="w-5 h-5" />
              Vouch System
            </Link>
            
            <Link href="/disputes" className={linkClass("/disputes")}>
              <Gavel className="w-5 h-5" />
              Disputes
            </Link>
            
            <Link href="/alt-detection" className={linkClass("/alt-detection")}>
              <AlertTriangle className="w-5 h-5" />
              Alt Detection
            </Link>
          </div>

          {/* Security */}
          <div className="pt-6">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Security
            </h3>
            <Link href="/threat-intel" className={linkClass("/threat-intel")}>
              <Shield className="w-5 h-5" />
              Threat Intelligence
            </Link>
            
            <Link href="/utilities" className={linkClass("/utilities")}>
              <Settings className="w-5 h-5" />
              Utilities
            </Link>
          </div>

          {/* Admin Only */}
          {typedUser && typedUser.role && typedUser.role === "admin" && (
            <div className="pt-6">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Administration
              </h3>
              <Link href="/admin" className={linkClass("/admin")}>
                <Settings className="w-5 h-5" />
                Admin Panel
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Footer */}
      <div className="mt-auto p-6 border-t border-gray-700">
        <div className="text-center text-xs text-gray-500">
          <p>Made by Kiro.java</p>
          <p>"I was too lazy 💀"</p>
          <p>Copyright 2025</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
export { Sidebar };
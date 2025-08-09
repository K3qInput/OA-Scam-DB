import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  FileText, 
  Plus, 
  Users, 
  Shield, 
  Settings, 
  BarChart3,
  Search,
  AlertTriangle,
  Mail,
  MessageSquare,
  UserCheck,
  Gavel
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (href: string) => location === href;
  
  const linkClass = (href: string) => cn(
    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
    isActive(href) 
      ? "bg-oa-red text-white" 
      : "text-slate-300 hover:bg-oa-gray/20 hover:text-white"
  );

  return (
    <nav className={cn("bg-oa-dark border-r border-oa-gray/20 w-64 min-h-screen", className)}>
      <div className="p-4">
        <div className="space-y-1">
          {/* Core Navigation */}
          <Link href="/dashboard" className={linkClass("/dashboard")}>
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
          
          <Link href="/new-case" className={linkClass("/new-case")}>
            <Plus className="mr-3 h-5 w-5" />
            New Case
          </Link>

          {/* Contact & Support Section */}
          <div className="pt-4">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Contact & Support
            </h3>
            <Link href="/contact" className={linkClass("/contact")}>
              <Mail className="mr-3 h-5 w-5" />
              Contact Us
            </Link>
            
            {user && ["admin", "tribunal_head", "senior_staff", "staff"].includes(user.role) && (
              <Link href="/contact-management" className={linkClass("/contact-management")}>
                <MessageSquare className="mr-3 h-5 w-5" />
                Manage Contacts
              </Link>
            )}
          </div>

          {/* Staff Management Section */}
          {user && ["admin", "tribunal_head", "senior_staff"].includes(user.role) && (
            <div className="pt-4">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Staff Management
              </h3>
              <Link href="/staff-management" className={linkClass("/staff-management")}>
                <Users className="mr-3 h-5 w-5" />
                Staff Members
              </Link>
              
              <Link href="/staff-assignments" className={linkClass("/staff-assignments")}>
                <UserCheck className="mr-3 h-5 w-5" />
                Assignments
              </Link>
            </div>
          )}

          {/* Tribunal Operations Section */}
          {user && ["admin", "tribunal_head"].includes(user.role) && (
            <div className="pt-4">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Tribunal Operations
              </h3>
              <Link href="/tribunal-proceedings" className={linkClass("/tribunal-proceedings")}>
                <Gavel className="mr-3 h-5 w-5" />
                Proceedings
              </Link>
            </div>
          )}

          {/* Security Section */}
          <div className="pt-4">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Security
            </h3>
            <Link href="/threat-intel" className={linkClass("/threat-intel")}>
              <Shield className="mr-3 h-5 w-5" />
              Threat Intelligence
            </Link>
          </div>

          {/* Admin Only */}
          {user && user.role === "admin" && (
            <div className="pt-4">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Administration
              </h3>
              <Link href="/admin" className={linkClass("/admin")}>
                <Settings className="mr-3 h-5 w-5" />
                Admin Panel
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-oa-gray/20">
        <div className="text-center text-xs text-slate-500">
          <p>Made by Kiro.java</p>
          <p>"I was too lazy 💀"</p>
          <p>Copyright 2025</p>
        </div>
      </div>
    </nav>
  );
}
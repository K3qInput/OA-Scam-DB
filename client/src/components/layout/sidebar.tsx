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
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    access: ["admin", "staff", "user"]
  },
  {
    name: "All Cases",
    href: "/cases",
    icon: FileText,
    access: ["admin", "staff"]
  },
  {
    name: "New Case",
    href: "/new-case",
    icon: Plus,
    access: ["admin", "staff", "user"]
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
    access: ["admin", "staff"]
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    access: ["admin", "staff"]
  },
  {
    name: "Search",
    href: "/search",
    icon: Search,
    access: ["admin", "staff"]
  },
  {
    name: "Appeals",
    href: "/appeals",
    icon: AlertTriangle,
    access: ["admin", "staff"]
  },
  {
    name: "Admin Panel",
    href: "/admin",
    icon: Shield,
    access: ["admin"]
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    access: ["admin", "staff", "user"]
  }
];

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    item.access.includes(user?.role || "user")
  );

  return (
    <nav className={cn("bg-oa-dark border-r border-oa-gray/20 w-64 min-h-screen", className)}>
      <div className="p-4">
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location === item.href || 
              (item.href !== "/dashboard" && location.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-oa-blue text-white" 
                    : "text-slate-300 hover:bg-oa-gray/20 hover:text-white"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
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
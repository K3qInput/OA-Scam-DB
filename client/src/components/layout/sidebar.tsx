import { 
  Database, 
  Plus, 
  Users, 
  Link, 
  Scale, 
  BarChart3, 
  Settings 
} from "lucide-react";
import { Link as RouterLink, useLocation } from "wouter";

const navigation = [
  { name: "Case Database", href: "/", icon: Database },
  { name: "New Report", href: "/new-case", icon: Plus },
  { name: "User Profiles", href: "/users", icon: Users },
  { name: "Alt Accounts", href: "/alt-accounts", icon: Link },
  { name: "Appeals", href: "/appeals", icon: Scale },
];

const adminNavigation = [
  { name: "Statistics", href: "/statistics", icon: BarChart3 },
  { name: "Admin Panel", href: "/admin", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-oa-dark border-r border-oa-surface">
      <div className="p-6">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href === "/" && location === "/dashboard");
            const Icon = item.icon;
            
            return (
              <RouterLink key={item.name} href={item.href}>
                <a className={`oa-sidebar-link ${isActive ? "active" : ""}`}>
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              </RouterLink>
            );
          })}
          
          <div className="border-t border-oa-surface my-4"></div>
          
          {adminNavigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <RouterLink key={item.name} href={item.href}>
                <a className={`oa-sidebar-link ${isActive ? "active" : ""}`}>
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              </RouterLink>
            );
          })}
        </nav>

        <div className="mt-8 p-4 bg-oa-surface rounded-lg">
          <h3 className="text-sm font-semibold mb-3 text-red-500">Staff Controls</h3>
          <div className="space-y-2 text-sm">
            <button className="w-full text-left text-gray-400 hover:text-white">
              Bulk Actions
            </button>
            <button className="w-full text-left text-gray-400 hover:text-white">
              Export Data
            </button>
            <button className="w-full text-left text-gray-400 hover:text-white">
              System Logs
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

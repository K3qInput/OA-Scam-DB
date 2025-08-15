import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Bell, Search, Menu, LogOut, User, Settings, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import NotificationSystem from "@/components/notification-system";
import { useLocation, Link } from "wouter";
import { CurrentTime } from "@/components/real-time-timestamp";


interface HeaderProps {
  onMenuToggle?: () => void;
  onSearch?: (query: string) => void;
}

// Placeholder for getPageTitle function, assuming it's defined elsewhere or will be provided.
// For this example, we'll use a dummy title.
const getPageTitle = () => "Dashboard"; 
// Placeholder for activeUsers, assuming it's defined elsewhere or will be provided.
const activeUsers = 123; 

function Header({ onMenuToggle, onSearch }: HeaderProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="md:hidden text-slate-300 hover:bg-slate-800 hover:text-white"
            data-testid="button-menu-toggle"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white">OwnersAlliance</h1>
            <span className="hidden sm:inline-block text-blue-500 text-sm">Portal</span>
            <div className="hidden lg:flex items-center gap-2 ml-4 text-gray-400 text-xs">
              <Clock className="h-3 w-3" />
              <CurrentTime className="font-mono" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search cases, users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch?.(e.target.value);
              }}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <NotificationSystem />
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg"
                data-testid="button-user-menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user?.profileImageUrl || undefined} 
                    alt={user?.username || "User"} 
                  />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {user?.username?.substring(0, 2).toUpperCase() || "OA"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {user?.username || "User"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {user?.role || "Member"}
                  </span>
                </div>
                <Settings className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end">
              <div className="px-3 py-2 border-b border-slate-700">
                <p className="text-sm font-medium text-white">
                  {user?.username || "User"}
                </p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem 
                asChild
                className="text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer"
              >
                <Link href="/profile" className="flex items-center w-full h-full px-2 py-1.5">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                asChild
                className="text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer"
              >
                <Link href="/settings" className="flex items-center w-full h-full px-2 py-1.5">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-400 hover:bg-red-900/20 hover:text-red-300 cursor-pointer"
                data-testid="button-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;
export { Header };
import { useState } from "react";
import { Search, Settings, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@shared/schema";
import PasswordResetModal from "@/components/password-reset-modal";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const { user, logout } = useAuth();
  const currentUser = user as User | undefined;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <>
      <nav className="bg-oa-dark border-b border-oa-surface px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="text-red-500 text-2xl" />
              <h1 className="text-xl font-bold">OwnersAlliance</h1>
              <span className="text-gray-400 text-sm">Database Portal</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search cases, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="oa-input w-80 pr-10"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </form>
            
            <div className="flex items-center space-x-2 bg-oa-surface px-4 py-2 rounded-lg">
              <Shield className="h-4 w-4 text-red-500" />
              <span className="text-sm capitalize">{currentUser?.role || 'User'}</span>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-300">{currentUser?.email || 'Loading...'}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPasswordReset(true)}
              className="text-gray-400 hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-400 hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
      />
    </>
  );
}

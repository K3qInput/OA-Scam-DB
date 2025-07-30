import { Heart, Code } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-oa-black border-t border-oa-surface py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <span>© 2025 OwnersAlliance</span>
            <span>•</span>
            <span>Scam Database Portal</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-400 text-sm mt-4 md:mt-0">
            <span>Made by</span>
            <span className="text-red-400 font-medium hover:text-red-300 transition-colors">
              Kiro.java
            </span>
            <Code className="h-4 w-4 text-gray-500" />
            <span>- I was too lazy 💀</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
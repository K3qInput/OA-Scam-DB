import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface EnhancedCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "stats" | "highlight" | "danger" | "success";
  hover?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = "default", hover = true, glow = false, children, ...props }, ref) => {
    const baseClasses = "oa-card p-6";
    
    const variantClasses = {
      default: "",
      stats: "oa-card-stats",
      highlight: "border-yellow-500/30 bg-gradient-to-br from-yellow-900/20 to-orange-900/20",
      danger: "border-red-500/30 bg-gradient-to-br from-red-900/20 to-red-800/20",
      success: "border-green-500/30 bg-gradient-to-br from-green-900/20 to-green-800/20"
    };

    const hoverClass = hover ? "oa-hover-lift" : "";
    const glowClass = glow ? "animate-glow" : "";

    return (
      <div
        className={cn(
          baseClasses,
          variantClasses[variant],
          hoverClass,
          glowClass,
          "animate-fade-in",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

export default EnhancedCard;

// Import necessary components
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import AnimatedCounter from "./animated-counter";

// Enhanced StatsCard component
interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  animationDelay?: number;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendDirection = 'neutral', 
  animationDelay = 0,
  className = ""
}: StatsCardProps) {
  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  return (
    <div 
      className={`bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-red-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 ${className}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                {icon}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-300 mb-1">{title}</p>
              <div className="flex items-center space-x-2">
                {typeof value === 'number' ? (
                  <AnimatedCounter 
                    value={value}
                    className="text-2xl font-bold text-white"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">{value}</span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function NotificationCard({ title, message, type = "info", onClose, className = "" }: {
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  onClose?: () => void;
  className?: string;
}) {
  const typeClasses = {
    info: "border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-blue-800/20",
    success: "border-green-500/30 bg-gradient-to-r from-green-900/20 to-green-800/20",
    warning: "border-yellow-500/30 bg-gradient-to-r from-yellow-900/20 to-yellow-800/20",
    error: "border-red-500/30 bg-gradient-to-r from-red-900/20 to-red-800/20"
  };

  return (
    <EnhancedCard 
      className={cn("oa-notification", typeClasses[type], className)}
      hover={false}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-white mb-1">{title}</h4>
          <p className="text-gray-300 text-sm">{message}</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors ml-4"
          >
            ×
          </button>
        )}
      </div>
    </EnhancedCard>
  );
}
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

// Specialized card components
export function StatsCard({ title, value, icon, trend, className = "", ...props }: {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
  className?: string;
  [key: string]: any;
}) {
  return (
    <EnhancedCard variant="stats" className={cn("animate-slide-in-up", className)} {...props}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-red-500/20 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </EnhancedCard>
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
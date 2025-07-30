import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "./loading-spinner";

interface EnhancedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  glow?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant = "primary", 
    size = "md", 
    loading = false, 
    glow = false,
    pulse = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
    
    const variantClasses = {
      primary: "oa-btn-primary focus:ring-red-500/20",
      secondary: "oa-btn-secondary focus:ring-gray-500/20", 
      success: "oa-btn-success focus:ring-green-500/20",
      warning: "oa-btn-warning focus:ring-yellow-500/20",
      danger: "oa-btn-danger focus:ring-red-500/20",
      ghost: "bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500"
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg"
    };

    const glowClass = glow ? "animate-glow" : "";
    const pulseClass = pulse ? "animate-pulse-red" : "";

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          glowClass,
          pulseClass,
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" className="mr-2" />}
        {children}
      </button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export default EnhancedButton;
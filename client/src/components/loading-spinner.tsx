interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

export default function LoadingSpinner({ size = "md", className = "", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div className="w-full h-full border-4 border-gray-600 border-t-red-500 rounded-full"></div>
      </div>
      {text && (
        <p className="text-gray-400 text-sm animate-pulse">
          {text}<span className="oa-loading-dots"></span>
        </p>
      )}
    </div>
  );
}

export function LoadingSkeleton({ className = "", ...props }) {
  return (
    <div 
      className={`oa-skeleton h-4 w-full ${className}`} 
      {...props}
    />
  );
}

export function LoadingCard({ className = "" }) {
  return (
    <div className={`oa-card p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-gray-700 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <LoadingSkeleton className="h-4 w-3/4" />
            <LoadingSkeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <LoadingSkeleton className="h-4 w-full" />
          <LoadingSkeleton className="h-4 w-5/6" />
          <LoadingSkeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import EnhancedCard from "./enhanced-card";
import AnimatedCounter from "./animated-counter";

interface QuickStatsProps {
  title: string;
  current: number;
  previous: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function QuickStats({ 
  title, 
  current, 
  previous, 
  suffix = "", 
  prefix = "",
  className = "" 
}: QuickStatsProps) {
  const [trend, setTrend] = useState<"up" | "down" | "neutral">("neutral");
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (previous === 0) {
      setTrend("neutral");
      setPercentage(0);
      return;
    }

    const change = ((current - previous) / previous) * 100;
    setPercentage(Math.abs(change));

    if (change > 0) {
      setTrend("up");
    } else if (change < 0) {
      setTrend("down");
    } else {
      setTrend("neutral");
    }
  }, [current, previous]);

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-400";
      case "down":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <EnhancedCard variant="stats" className={`p-6 ${className}`}>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-white">
            {prefix}
            <AnimatedCounter value={current} />
            {suffix}
          </span>
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-xs font-medium">
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          vs previous period ({prefix}{previous}{suffix})
        </p>
      </div>
    </EnhancedCard>
  );
}
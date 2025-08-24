import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: LucideIcon;
  gradient: string;
  "data-testid"?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  gradient,
  "data-testid": testId 
}: StatsCardProps) {
  const TrendIcon = changeType === "positive" ? TrendingUp : TrendingDown;
  const changeColor = changeType === "positive" ? "text-accent-600" : "text-red-500";

  return (
    <div 
      className="dashboard-card bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg"
      data-testid={testId || `stats-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium" data-testid="stats-title">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-800 mt-2" data-testid="stats-value">
            {value}
          </p>
          <p className={`${changeColor} text-sm mt-1`} data-testid="stats-change">
            <TrendIcon className="inline mr-1 h-3 w-3" />
            {change}
          </p>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center animate-float`}>
          <Icon className="text-white text-xl" data-testid="stats-icon" />
        </div>
      </div>
    </div>
  );
}

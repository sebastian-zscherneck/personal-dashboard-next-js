import { HTMLAttributes } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  prefix?: string;
  suffix?: string;
}

const StatCard = ({
  label,
  value,
  trend,
  prefix = "",
  suffix = "",
  className = "",
  ...props
}: StatCardProps) => {
  return (
    <div
      className={`p-6 border border-white/5 bg-[#0F0F0F] ${className}`}
      {...props}
    >
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-semibold tracking-tighter text-white">
          {prefix}
          {value}
          {suffix}
        </p>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs ${
              trend.isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export { StatCard };
export type { StatCardProps };

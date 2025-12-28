import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
}

const Badge = ({
  className = "",
  variant = "default",
  children,
  ...props
}: BadgeProps) => {
  const variants = {
    default: "text-[#E0FF00]",
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
    info: "text-blue-500",
  };

  return (
    <span
      className={`text-xs font-semibold ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

interface StatusDotProps extends HTMLAttributes<HTMLDivElement> {
  status: "active" | "inactive" | "pending" | "error";
}

const StatusDot = ({ status, className = "", ...props }: StatusDotProps) => {
  const colors = {
    active: "bg-green-500",
    inactive: "bg-gray-500",
    pending: "bg-yellow-500",
    error: "bg-red-500",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
    </div>
  );
};

export { Badge, StatusDot };
export type { BadgeProps, StatusDotProps };

import { forwardRef, HTMLAttributes } from "react";
import { ArrowUpRight } from "lucide-react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "action";
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = "",
      variant = "default",
      hoverable = false,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: "bg-[#0F0F0F] border-white/5",
      elevated: "bg-[#1B2124] border-white/10",
      action: "bg-[#1B2124] border-white/10 cursor-pointer",
    };

    const hoverStyles = hoverable
      ? "hover:border-white/10 transition-colors"
      : "";

    const actionStyles =
      variant === "action"
        ? "hover:border-[#E0FF00] hover:shadow-[0_0_20px_rgba(224,255,0,0.05)] transition-all duration-200"
        : "";

    return (
      <div
        ref={ref}
        className={`border p-6 ${variants[variant]} ${hoverStyles} ${actionStyles} ${className}`}
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

interface ActionCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
}

const ActionCard = forwardRef<HTMLDivElement, ActionCardProps>(
  ({ className = "", title, onClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`group w-full bg-[#1B2124] border border-white/10 p-4 hover:border-[#E0FF00] hover:shadow-[0_0_20px_rgba(224,255,0,0.05)] transition-all duration-200 cursor-pointer ${className}`}
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
        }}
        onClick={onClick}
        {...props}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="w-1.5 h-1.5 bg-[#E0FF00]" />
          <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#E0FF00] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
        </div>
        <span className="text-[10px] font-bold text-gray-300 group-hover:text-white transition-colors uppercase tracking-widest">
          {title}
        </span>
      </div>
    );
  }
);

ActionCard.displayName = "ActionCard";

export { Card, ActionCard };
export type { CardProps, ActionCardProps };

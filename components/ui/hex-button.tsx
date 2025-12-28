import { forwardRef, ButtonHTMLAttributes } from "react";

interface HexButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  icon: React.ReactNode;
}

const HexButton = forwardRef<HTMLButtonElement, HexButtonProps>(
  ({ className = "", size = "md", icon, ...props }, ref) => {
    const sizes = {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
    };

    return (
      <button
        ref={ref}
        className={`flex items-center justify-center text-gray-400 bg-[#1B2124] border border-white/20 hover:bg-[#E0FF00] hover:text-black hover:border-[#E0FF00] active:scale-95 transition-all duration-200 focus:outline-none ${sizes[size]} ${className}`}
        style={{
          clipPath:
            "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
        }}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

HexButton.displayName = "HexButton";

export { HexButton };
export type { HexButtonProps };

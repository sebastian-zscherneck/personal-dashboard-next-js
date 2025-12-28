import { HTMLAttributes } from "react";

interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  action?: React.ReactNode;
}

const SectionHeader = ({
  title,
  action,
  className = "",
  ...props
}: SectionHeaderProps) => {
  return (
    <div
      className={`flex items-center justify-between border-b border-white/10 pb-2 mb-4 ${className}`}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div className="w-1 h-1 bg-[#E0FF00]" />
        <h3 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
          {title.replace(/ /g, "_")}
        </h3>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps extends HTMLAttributes<HTMLDivElement> {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items, className = "", ...props }: BreadcrumbProps) => {
  return (
    <div
      className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 ${className}`}
      {...props}
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <div className="w-1.5 h-1.5 bg-gray-700 transform rotate-45" />
          )}
          {item.href ? (
            <a
              href={item.href}
              className="hover:text-[#E0FF00] transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-white">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export { SectionHeader, Breadcrumb };
export type { SectionHeaderProps, BreadcrumbProps, BreadcrumbItem };

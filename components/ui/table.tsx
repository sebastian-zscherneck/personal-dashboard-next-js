import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

type TableProps = HTMLAttributes<HTMLTableElement>;

const Table = ({ className = "", children, ...props }: TableProps) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement>;

const TableHeader = ({ className = "", children, ...props }: TableHeaderProps) => {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
};

type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

const TableBody = ({ className = "", children, ...props }: TableBodyProps) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
};

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  hoverable?: boolean;
}

const TableRow = ({
  className = "",
  hoverable = true,
  children,
  ...props
}: TableRowProps) => {
  return (
    <tr
      className={`border-b border-white/5 ${
        hoverable ? "hover:bg-white/5 transition-colors" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

type TableHeadProps = ThHTMLAttributes<HTMLTableCellElement>;

const TableHead = ({ className = "", children, ...props }: TableHeadProps) => {
  return (
    <th
      className={`text-left text-[10px] font-bold uppercase tracking-widest text-gray-500 pb-3 ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

type TableCellProps = TdHTMLAttributes<HTMLTableCellElement>;

const TableCell = ({ className = "", children, ...props }: TableCellProps) => {
  return (
    <td className={`py-4 text-sm text-gray-300 ${className}`} {...props}>
      {children}
    </td>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
export type {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
};

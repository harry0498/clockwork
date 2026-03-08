import type { ReactNode } from "react";

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export interface Column<T> {
  key?: string;
  header: string | ReactNode;
  accessor: keyof T | ((row: T) => ReactNode);
  align?: "left" | "right" | "center";
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  footer?: ReactNode;
}

function colKey<T>(col: Column<T>, index: number): string {
  if (col.key) return col.key;
  if (typeof col.header === "string") return col.header;
  return `col-${index}`;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  footer,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((col, i) => (
              <th
                key={colKey(col, i)}
                className={`px-4 py-3 font-medium ${alignClass[col.align ?? "left"]} ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              className="border-b border-border last:border-0"
            >
              {columns.map((col, i) => {
                const content =
                  typeof col.accessor === "function"
                    ? col.accessor(row)
                    : (row[col.accessor] as ReactNode);
                return (
                  <td
                    key={colKey(col, i)}
                    className={`px-4 py-3 ${alignClass[col.align ?? "left"]} ${col.className ?? ""}`}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        {footer && <tfoot>{footer}</tfoot>}
      </table>
    </div>
  );
}

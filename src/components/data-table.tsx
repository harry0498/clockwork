import type { ReactNode } from "react";
import { IndeterminateCheckbox } from "@/components/indeterminate-checkbox";
import { Pagination } from "@/components/pagination";
import { SortableHeader } from "@/components/sortable-header";

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
  hideOnMobile?: boolean;
  sortKey?: string;
}

interface SelectionProps {
  selectedKeys: Set<string>;
  onToggle: (key: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
  isSelectable?: (key: string) => boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  footer?: ReactNode;
  actions?: (row: T) => ReactNode;
  pagination?: { currentPage: number; pageCount: number };
  selection?: SelectionProps;
  sorting?: { sort: string | null; dir: "asc" | "desc" | null };
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
  actions,
  pagination,
  selection,
  sorting,
}: DataTableProps<T>) {
  const allColumns: Column<T>[] = actions
    ? [
        ...columns,
        { key: "actions", header: "", align: "right", accessor: actions },
      ]
    : columns;

  return (
    <div>
      <div className="overflow-x-auto overflow-hidden rounded-lg border border-border shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              {selection && (
                <th className="w-10 px-3 py-3">
                  <IndeterminateCheckbox
                    checked={selection.allSelected}
                    indeterminate={
                      selection.someSelected && !selection.allSelected
                    }
                    onChange={selection.onToggleAll}
                  />
                </th>
              )}
              {allColumns.map((col, i) => (
                <th
                  key={colKey(col, i)}
                  className={`px-4 py-3 text-xs uppercase tracking-wide ${alignClass[col.align ?? "left"]} ${col.className ?? ""} ${col.hideOnMobile ? "hidden md:table-cell" : ""}`}
                >
                  {sorting && col.sortKey && typeof col.header === "string" ? (
                    <SortableHeader
                      label={col.header}
                      sortKey={col.sortKey}
                      currentSort={sorting.sort}
                      currentDir={sorting.dir}
                    />
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const key = keyExtractor(row);
              const selectable = selection?.isSelectable
                ? selection.isSelectable(key)
                : true;
              return (
                <tr
                  key={key}
                  className="border-b border-border last:border-0 transition-colors hover:bg-muted/50"
                >
                  {selection && (
                    <td className="w-10 px-3 py-3">
                      <IndeterminateCheckbox
                        checked={selection.selectedKeys.has(key)}
                        onChange={() => selection.onToggle(key)}
                        disabled={!selectable}
                      />
                    </td>
                  )}
                  {allColumns.map((col, i) => {
                    const content =
                      typeof col.accessor === "function"
                        ? col.accessor(row)
                        : (row[col.accessor] as ReactNode);
                    return (
                      <td
                        key={colKey(col, i)}
                        className={`px-4 py-3 ${alignClass[col.align ?? "left"]} ${col.className ?? ""} ${col.hideOnMobile ? "hidden md:table-cell" : ""}`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          {footer && <tfoot>{footer}</tfoot>}
        </table>
      </div>
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          pageCount={pagination.pageCount}
        />
      )}
    </div>
  );
}

import { useMemo, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';
import type { CatalogRow } from '../../types/catalog';
import { RythmeBadge } from './RythmeBadge';

const columns: ColumnDef<CatalogRow>[] = [
  { accessorKey: 'ecole', header: 'École', size: 180 },
  { accessorKey: 'cpCode', header: 'Code', size: 80 },
  { accessorKey: 'cursus', header: 'Cursus pédagogique', size: 250 },
  { accessorKey: 'nivCode', header: 'Niv.', size: 80 },
  { accessorKey: 'niveau', header: 'Niveau pédagogique', size: 250 },
  { accessorKey: 'spec', header: 'Spécialisation', size: 200 },
  {
    accessorKey: 'rythme',
    header: 'Rythme',
    size: 160,
    cell: ({ getValue }) => <RythmeBadge value={getValue() as string} />,
  },
  { accessorKey: 'annee', header: 'Année', size: 110 },
  { accessorKey: 'session', header: 'Session', size: 100 },
  { accessorKey: 'sessEff', header: 'Session effective', size: 250 },
];

interface Props {
  data: CatalogRow[];
}

export function CatalogTable({ data }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 20,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const totalWidth = table.getTotalSize();

  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders();
    const vars: Record<string, string> = {};
    for (const header of headers) {
      vars[`--header-${header.id}-size`] = `${header.getSize()}px`;
      vars[`--col-${header.column.id}-size`] = `${header.column.getSize()}px`;
    }
    return vars;
  }, [table.getState().columnSizingInfo]);

  return (
    <div
      ref={parentRef}
      className="bg-white rounded-xl border border-slate-200 overflow-auto"
      style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}
    >
      <table className="border-collapse table-fixed" style={{ ...columnSizeVars, width: totalWidth }}>
        <thead className="sticky top-0 z-10">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="bg-slate-800 text-white text-left text-xs font-medium px-3 py-2.5 cursor-pointer select-none whitespace-nowrap hover:bg-slate-700 transition-colors"
                  style={{ width: header.getSize() }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <span className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' ? (
                      <ArrowUp size={14} />
                    ) : header.column.getIsSorted() === 'desc' ? (
                      <ArrowDown size={14} />
                    ) : (
                      <ArrowUpDown size={14} className="opacity-30" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {virtualRows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-slate-400 text-sm">
                Aucun résultat pour ces filtres
              </td>
            </tr>
          )}
          {virtualRows.length > 0 && (
            <tr style={{ height: virtualRows[0].start }}>
              <td colSpan={columns.length} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                className="hover:bg-indigo-50/50 transition-colors"
                style={{ height: virtualRow.size }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-1.5 text-xs border-b border-slate-100 whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ width: cell.column.getSize(), maxWidth: cell.column.getSize() }}
                    title={String(cell.getValue() ?? '')}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {virtualRows.length > 0 && (
            <tr style={{ height: totalSize - (virtualRows[virtualRows.length - 1].end) }}>
              <td colSpan={columns.length} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

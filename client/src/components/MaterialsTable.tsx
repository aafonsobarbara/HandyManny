import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import useQuoteStore from '../store/quoteStore';
import { MaterialItem } from '../types/quote';
import { formatCurrency } from '../utils/calculations';

const columns: ColumnDef<MaterialItem>[] = [
  {
    header: 'Item',
    accessorKey: 'item'
  },
  {
    header: 'Qty',
    accessorKey: 'qty'
  },
  {
    header: 'Unit',
    accessorKey: 'unit'
  },
  {
    header: 'Store',
    accessorKey: 'store'
  },
  {
    header: 'Unit Price',
    cell: ({ row }) => (row.original.unitPrice ? formatCurrency(row.original.unitPrice) : '—')
  },
  {
    header: 'Total',
    cell: ({ row }) => (row.original.total ? formatCurrency(row.original.total) : '—')
  },
  {
    header: 'Link',
    cell: ({ row }) =>
      row.original.link ? (
        <a className="text-primary underline" href={row.original.link} target="_blank" rel="noreferrer">
          View
        </a>
      ) : (
        <span className="text-xs text-slate-400">Pending</span>
      )
  }
];

const MaterialsTable: React.FC = () => {
  const { activeQuote } = useQuoteStore();
  const table = useReactTable({
    data: activeQuote?.materials || [],
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Materials</h3>
        <span className="text-xs uppercase text-slate-400">Locked after chat</span>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 text-slate-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-slate-400" colSpan={columns.length}>
                  Materials will appear here after the AI chat extracts them.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialsTable;

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import useQuoteStore from '../store/quoteStore';
import { LaborItem } from '../types/quote';
import { formatCurrency } from '../utils/calculations';

const columns: ColumnDef<LaborItem>[] = [
  {
    header: 'Service',
    accessorKey: 'description'
  },
  {
    header: 'Est. Hours',
    accessorKey: 'hours'
  },
  {
    header: 'Rate ($/h)',
    accessorKey: 'rate'
  },
  {
    header: 'Subtotal',
    cell: ({ row }) => formatCurrency(row.original.total ?? row.original.rate * row.original.hours)
  }
];

const LaborTable: React.FC = () => {
  const { activeQuote } = useQuoteStore();
  const table = useReactTable({
    data: activeQuote?.labor || [],
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Labor</h3>
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
                  Labor items will appear here after the AI chat extracts them.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LaborTable;

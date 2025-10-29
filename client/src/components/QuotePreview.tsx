import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import useQuoteStore from '../store/quoteStore';
import { formatCurrency } from '../utils/calculations';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

const QuotePreview: React.FC = () => {
  const { activeQuote } = useQuoteStore();

  if (!activeQuote) {
    return null;
  }

  const renderPdf = () => {
    const docDefinition = {
      content: [
        { text: 'Handyman Quote Generator', style: 'header' },
        {
          columns: [
            [
              { text: 'HandyManny Services', style: 'subheader' },
              { text: '123 Pro Lane, Springfield, USA' },
              { text: 'Phone: (555) 555-0199' }
            ],
            [
              { text: 'Quote Date: ' + new Date(activeQuote.quoteDate).toLocaleDateString(), alignment: 'right' },
              { text: `Status: ${activeQuote.status}`, alignment: 'right' }
            ]
          ]
        },
        { text: 'Client', style: 'subheader', margin: [0, 10, 0, 4] },
        {
          stack: [
            activeQuote.clientName,
            activeQuote.clientAddress,
            activeQuote.clientPhone,
            activeQuote.clientEmail
          ],
          margin: [0, 0, 0, 10]
        },
        { text: 'Materials', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['Item', 'Qty', 'Store', 'Unit Price', 'Total'],
              ...activeQuote.materials.map((material) => [
                material.item,
                material.qty,
                material.store || '-',
                material.unitPrice ? formatCurrency(material.unitPrice) : '-',
                material.total ? formatCurrency(material.total) : '-'
              ])
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 10]
        },
        { text: 'Labor', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              ['Service', 'Hours', 'Rate', 'Subtotal'],
              ...activeQuote.labor.map((labor) => [
                labor.description,
                labor.hours,
                formatCurrency(labor.rate),
                formatCurrency(labor.total ?? labor.rate * labor.hours)
              ])
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 10]
        },
        { text: 'Terms & Conditions', style: 'subheader' },
        { text: activeQuote.terms, margin: [0, 4, 0, 10] }
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 4]
        }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Quote Preview</h3>
        <button
          onClick={renderPdf}
          className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Generate PDF
        </button>
      </div>
      <div className="mt-4 space-y-4">
        <div className="rounded border border-slate-200 p-4 text-sm">
          <h4 className="font-semibold text-slate-700">Client</h4>
          <p>{activeQuote.clientName}</p>
          <p>{activeQuote.clientAddress}</p>
          <p>{activeQuote.clientPhone}</p>
          {activeQuote.clientEmail && <p>{activeQuote.clientEmail}</p>}
        </div>
        <div className="rounded border border-slate-200 p-4 text-sm">
          <h4 className="font-semibold text-slate-700">Materials</h4>
          <ul className="mt-2 space-y-1">
            {activeQuote.materials.map((material, index) => (
              <li key={`${material.item}-${index}`} className="flex justify-between">
                <span>{material.item}</span>
                <span>{formatCurrency(material.total ?? 0)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded border border-slate-200 p-4 text-sm">
          <h4 className="font-semibold text-slate-700">Labor</h4>
          <ul className="mt-2 space-y-1">
            {activeQuote.labor.map((labor, index) => (
              <li key={`${labor.description}-${index}`} className="flex justify-between">
                <span>{labor.description}</span>
                <span>{formatCurrency(labor.total ?? labor.rate * labor.hours)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded border border-slate-200 p-4 text-sm">
          <h4 className="font-semibold text-slate-700">Terms</h4>
          <pre className="whitespace-pre-wrap text-xs text-slate-500">{activeQuote.terms}</pre>
        </div>
      </div>
    </div>
  );
};

export default QuotePreview;

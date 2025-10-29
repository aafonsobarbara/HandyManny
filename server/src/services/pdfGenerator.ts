import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { format } from 'date-fns';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fonts = {
  Roboto: {
    normal: path.resolve(__dirname, '../../node_modules/pdfmake/examples/fonts/Roboto-Regular.ttf'),
    bold: path.resolve(__dirname, '../../node_modules/pdfmake/examples/fonts/Roboto-Medium.ttf'),
    italics: path.resolve(__dirname, '../../node_modules/pdfmake/examples/fonts/Roboto-Italic.ttf'),
    bolditalics: path.resolve(__dirname, '../../node_modules/pdfmake/examples/fonts/Roboto-MediumItalic.ttf')
  }
};

const printer = new PdfPrinter(fonts);

interface MaterialRow {
  item: string;
  qty: number;
  store?: string;
  unitPrice?: number;
  total?: number;
}

interface LaborRow {
  description: string;
  hours: number;
  rate: number;
  total?: number;
}

interface QuoteData {
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail?: string;
  quoteDate: string;
  status: string;
  terms: string;
  materials: MaterialRow[];
  labor: LaborRow[];
  totals: {
    materials: number;
    labor: number;
    helpers: number;
    fuel: number;
    totalCost: number;
    clientPrice: number;
    grossProfit: number;
  };
}

export const buildQuotePdf = (quote: QuoteData) => {
  const docDefinition: TDocumentDefinitions = {
    content: [
      { text: 'Handyman Quote', style: 'header' },
      { text: format(new Date(quote.quoteDate), 'PPP'), alignment: 'right' },
      { text: `Status: ${quote.status}`, alignment: 'right', margin: [0, 0, 0, 10] },
      { text: 'Client', style: 'subheader' },
      { text: `${quote.clientName}\n${quote.clientAddress}\n${quote.clientPhone}${quote.clientEmail ? `\n${quote.clientEmail}` : ''}` },
      { text: 'Materials', style: 'subheader', margin: [0, 10, 0, 4] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            ['Item', 'Qty', 'Store', 'Total'],
            ...quote.materials.map((material) => [
              material.item,
              material.qty,
              material.store || '-',
              material.total ? `$${material.total.toFixed(2)}` : '-'
            ])
          ]
        },
        layout: 'lightHorizontalLines'
      },
      { text: 'Labor', style: 'subheader', margin: [0, 10, 0, 4] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            ['Service', 'Hours', 'Subtotal'],
            ...quote.labor.map((labor) => [
              labor.description,
              labor.hours,
              `$${(labor.total ?? labor.rate * labor.hours).toFixed(2)}`
            ])
          ]
        },
        layout: 'lightHorizontalLines'
      },
      { text: 'Totals', style: 'subheader', margin: [0, 10, 0, 4] },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            ['Materials', `$${quote.totals.materials.toFixed(2)}`],
            ['Labor', `$${quote.totals.labor.toFixed(2)}`],
            ['Helpers', `$${quote.totals.helpers.toFixed(2)}`],
            ['Fuel', `$${quote.totals.fuel.toFixed(2)}`],
            ['Total Cost', `$${quote.totals.totalCost.toFixed(2)}`],
            ['Client Price', `$${quote.totals.clientPrice.toFixed(2)}`],
            ['Gross Profit', `$${quote.totals.grossProfit.toFixed(2)}`]
          ]
        },
        layout: 'lightHorizontalLines'
      },
      { text: 'Terms & Conditions', style: 'subheader', margin: [0, 10, 0, 4] },
      { text: quote.terms }
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
    },
    defaultStyle: {
      font: 'Roboto'
    }
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition, {});
  return pdfDoc;
};

import { Router } from 'express';
import db from '../db/connection.js';
import { buildQuotePdf } from '../services/pdfGenerator.js';

const router = Router();

router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
    if (!row) {
      res.status(404).json({ message: 'Quote not found' });
      return;
    }
    const materials = db.prepare('SELECT * FROM quote_materials WHERE quote_id = ?').all(id);
    const labor = db.prepare('SELECT * FROM quote_labor WHERE quote_id = ?').all(id);
    const client = JSON.parse(row.client_json);
    const helperTotals = client.helperConfig?.enabled
      ? client.helperConfig.helpers * client.helperConfig.days * client.helperConfig.dailyRate
      : 0;
    const fuelTotal = (client.travelConfig?.miles || 0) * 2 * (client.travelConfig?.fuelRate || 0.2);

    const materialTotal = materials.reduce((sum, item) => sum + (item.total || 0), 0);
    const laborTotal = labor.reduce((sum, l) => sum + (l.total || l.rate * l.hours), 0);
    const totalCost = materialTotal + laborTotal + helperTotals + fuelTotal;
    const clientPrice = client.clientPrice || totalCost * (1 + (row.margin || 0) / 100);
    const grossProfit = clientPrice - totalCost;

    const totals = {
      materials: materialTotal,
      labor: laborTotal,
      helpers: helperTotals,
      fuel: fuelTotal,
      totalCost,
      clientPrice,
      grossProfit
    };

    const pdfDoc = buildQuotePdf({
      clientName: client.clientName,
      clientAddress: client.clientAddress,
      clientPhone: client.clientPhone,
      clientEmail: client.clientEmail,
      quoteDate: client.quoteDate || row.created_at,
      status: row.status,
      terms: row.terms,
      materials,
      labor,
      totals
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="quote-${id}.pdf"`);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    next(error);
  }
});

export default router;

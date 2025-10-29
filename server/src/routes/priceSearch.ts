import { Router } from 'express';
import db from '../db/connection.js';
import { researchMaterialPrices } from '../services/priceScraper.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { quoteId } = req.body;
    const materials = db
      .prepare('SELECT item, qty, unit, manual FROM quote_materials WHERE quote_id = ?')
      .all(quoteId)
      .filter((material) => !material.manual);
    if (!materials.length) {
      res.status(400).json({ message: 'No materials to research.' });
      return;
    }
    const aggregated = await researchMaterialPrices(materials);
    const updateStmt = db.prepare(
      'UPDATE quote_materials SET store = ?, unit_price = ?, total = ?, link = ?, manual = 0 WHERE quote_id = ? AND item = ?'
    );
    aggregated.forEach((material) => {
      updateStmt.run(material.store, material.unitPrice, material.total, material.link, quoteId, material.item);
    });
    res.json({ message: 'Price research complete', materials: aggregated });
  } catch (error) {
    next(error);
  }
});

export default router;

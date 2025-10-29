import { Router } from 'express';
import db from '../db/connection.js';
import { DEFAULT_TERMS } from '../config/defaultTerms.js';
import { parseServiceChat } from '../services/aiChat.js';

const upsertMaterialRows = (quoteId: number, materials: any[]) => {
  db.prepare('DELETE FROM quote_materials WHERE quote_id = ?').run(quoteId);
  const stmt = db.prepare(
    'INSERT INTO quote_materials (quote_id, item, qty, unit, store, unit_price, total, link, manual) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)' 
  );
  materials.forEach((material) => {
    stmt.run(
      quoteId,
      material.item,
      material.qty,
      material.unit,
      material.store,
      material.unitPrice,
      material.total,
      material.link,
      material.manual ? 1 : 0
    );
  });
};

const upsertLaborRows = (quoteId: number, laborRows: any[]) => {
  db.prepare('DELETE FROM quote_labor WHERE quote_id = ?').run(quoteId);
  const stmt = db.prepare('INSERT INTO quote_labor (quote_id, description, rate, hours, total) VALUES (?, ?, ?, ?, ?)');
  laborRows.forEach((labor) => {
    stmt.run(quoteId, labor.description, labor.rate, labor.hours, labor.total);
  });
};

const router = Router();

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM quotes ORDER BY updated_at DESC').all();
  const quotes = rows.map((row) => ({
    id: row.id,
    status: row.status,
    margin: row.margin,
    terms: row.terms,
    quoteDate: JSON.parse(row.client_json).quoteDate || row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...JSON.parse(row.client_json),
    materials: db
      .prepare('SELECT * FROM quote_materials WHERE quote_id = ?')
      .all(row.id)
      .map((material) => ({ ...material, manual: Boolean(material.manual) })),
    labor: db.prepare('SELECT * FROM quote_labor WHERE quote_id = ?').all(row.id)
  }));
  res.json(quotes);
});

router.post('/', (req, res) => {
  const payload = req.body;
  const now = new Date().toISOString();
  const info = db
    .prepare(
      'INSERT INTO quotes (client_json, status, margin, terms, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)' 
    )
    .run(
      JSON.stringify({ ...payload, quoteDate: payload.quoteDate || now }),
      payload.status || 'Draft',
      payload.margin || 0,
      payload.terms || DEFAULT_TERMS,
      now,
      now
    );
  const quoteId = Number(info.lastInsertRowid);
  if (payload.materials) {
    upsertMaterialRows(quoteId, payload.materials);
  }
  if (payload.labor) {
    upsertLaborRows(quoteId, payload.labor);
  }
  res.status(201).json({ ...payload, id: quoteId, createdAt: now, updatedAt: now });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const now = new Date().toISOString();
  db.prepare('UPDATE quotes SET client_json = ?, status = ?, margin = ?, terms = ?, updated_at = ? WHERE id = ?').run(
    JSON.stringify({ ...payload }),
    payload.status || 'Draft',
    payload.margin || 0,
    payload.terms || DEFAULT_TERMS,
    now,
    id
  );
  if (payload.materials) {
    upsertMaterialRows(Number(id), payload.materials);
  }
  if (payload.labor) {
    upsertLaborRows(Number(id), payload.labor);
  }
  res.json({ ...payload, id: Number(id), updatedAt: now });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM quotes WHERE id = ?').run(id);
  res.status(204).send();
});

router.post('/:id/approve', (req, res) => {
  const { id } = req.params;
  const now = new Date().toISOString();
  db.prepare('UPDATE quotes SET status = ?, updated_at = ? WHERE id = ?').run('Approved', now, id);
  const row = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
  const quote = {
    id: row.id,
    status: row.status,
    margin: row.margin,
    terms: row.terms,
    quoteDate: JSON.parse(row.client_json).quoteDate || row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...JSON.parse(row.client_json),
    materials: db
      .prepare('SELECT * FROM quote_materials WHERE quote_id = ?')
      .all(row.id)
      .map((material) => ({ ...material, manual: Boolean(material.manual) })),
    labor: db.prepare('SELECT * FROM quote_labor WHERE quote_id = ?').all(row.id)
  };
  res.json(quote);
});

router.post('/chat', async (req, res, next) => {
  try {
    const { messages } = req.body;
    const parsed = await parseServiceChat(messages);
    res.json(parsed);
  } catch (error) {
    next(error);
  }
});

export default router;

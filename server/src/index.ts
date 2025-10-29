import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import quotesRouter from './routes/quotes.js';
import priceSearchRouter from './routes/priceSearch.js';
import distanceRouter from './routes/distance.js';
import pdfRouter from './routes/pdf.js';
import { errorHandler } from './middleware/errorHandler.js';
import { runMigrations } from './db/connection.js';

dotenv.config();

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(cors());
app.use(helmet());

runMigrations();

app.use('/api/quotes', quotesRouter);
app.use('/api/price-search', priceSearchRouter);
app.use('/api/distance', distanceRouter);
app.use('/api/pdf', pdfRouter);
app.use(errorHandler);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

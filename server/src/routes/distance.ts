import { Router } from 'express';
import { getDistanceMiles } from '../services/distance.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { origin, destination } = req.body;
    if (!origin || !destination) {
      res.status(400).json({ message: 'Origin and destination are required.' });
      return;
    }
    const miles = await getDistanceMiles(origin, destination);
    res.json({ miles });
  } catch (error) {
    next(error);
  }
});

export default router;

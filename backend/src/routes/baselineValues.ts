import { Router, Request, Response } from 'express';
import BaselineValue from '../models/BaselineValue';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const values = Array.isArray(req.body) ? req.body : [req.body];
    const savedValues = await BaselineValue.insertMany(values);
    res.status(201).json({ success: true, data: savedValues });
  } catch (error: any) {
    console.error('Error creating baseline values:', error);
    res.status(500).json({ success: false, message: 'Failed to create baseline values', error: error.message });
  }
});

router.get('/session/:session_id', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const values = await BaselineValue.find({ session_id }).sort({ rank_order: 1 });
    res.json({ success: true, data: values });
  } catch (error: any) {
    console.error('Error fetching baseline values:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch baseline values', error: error.message });
  }
});

export default router;

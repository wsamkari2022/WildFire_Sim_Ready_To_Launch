import { Router, Request, Response } from 'express';
import ValueEvolution from '../models/ValueEvolution';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const evolution = new ValueEvolution(req.body);
    const savedEvolution = await evolution.save();
    res.status(201).json({ success: true, data: savedEvolution });
  } catch (error: any) {
    console.error('Error creating value evolution:', error);
    res.status(500).json({ success: false, message: 'Failed to create value evolution', error: error.message });
  }
});

router.get('/session/:session_id', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const evolutions = await ValueEvolution.find({ session_id }).sort({ createdAt: 1 });
    res.json({ success: true, data: evolutions });
  } catch (error: any) {
    console.error('Error fetching value evolutions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch value evolutions', error: error.message });
  }
});

export default router;

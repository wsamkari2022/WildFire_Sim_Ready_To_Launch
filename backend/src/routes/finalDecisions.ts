import { Router, Request, Response } from 'express';
import FinalDecision from '../models/FinalDecision';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const decision = new FinalDecision(req.body);
    const savedDecision = await decision.save();
    res.status(201).json({ success: true, data: savedDecision });
  } catch (error: any) {
    console.error('Error creating final decision:', error);
    res.status(500).json({ success: false, message: 'Failed to create final decision', error: error.message });
  }
});

router.get('/session/:session_id', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const decisions = await FinalDecision.find({ session_id }).sort({ scenario_id: 1 });
    res.json({ success: true, data: decisions });
  } catch (error: any) {
    console.error('Error fetching final decisions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch final decisions', error: error.message });
  }
});

export default router;

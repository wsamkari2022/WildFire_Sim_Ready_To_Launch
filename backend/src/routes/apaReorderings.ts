import { Router, Request, Response } from 'express';
import APAReordering from '../models/APAReordering';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const reordering = new APAReordering(req.body);
    const savedReordering = await reordering.save();
    res.status(201).json({ success: true, data: savedReordering });
  } catch (error: any) {
    console.error('Error creating APA reordering:', error);
    res.status(500).json({ success: false, message: 'Failed to create APA reordering', error: error.message });
  }
});

router.get('/session/:session_id', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const reorderings = await APAReordering.find({ session_id }).sort({ createdAt: 1 });
    res.json({ success: true, data: reorderings });
  } catch (error: any) {
    console.error('Error fetching APA reorderings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch APA reorderings', error: error.message });
  }
});

export default router;

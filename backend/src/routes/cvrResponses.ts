import { Router, Request, Response } from 'express';
import CVRResponse from '../models/CVRResponse';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const cvrResponse = new CVRResponse(req.body);
    const savedResponse = await cvrResponse.save();
    res.status(201).json({ success: true, data: savedResponse });
  } catch (error: any) {
    console.error('Error creating CVR response:', error);
    res.status(500).json({ success: false, message: 'Failed to create CVR response', error: error.message });
  }
});

router.get('/session/:session_id', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const responses = await CVRResponse.find({ session_id }).sort({ createdAt: 1 });
    res.json({ success: true, data: responses });
  } catch (error: any) {
    console.error('Error fetching CVR responses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch CVR responses', error: error.message });
  }
});

export default router;

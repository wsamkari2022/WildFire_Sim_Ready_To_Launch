import { Router, Request, Response } from 'express';
import SessionFeedback from '../models/SessionFeedback';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const feedback = new SessionFeedback(req.body);
    const savedFeedback = await feedback.save();
    res.status(201).json({ success: true, data: savedFeedback });
  } catch (error: any) {
    console.error('Error creating session feedback:', error);
    res.status(500).json({ success: false, message: 'Failed to create session feedback', error: error.message });
  }
});

router.get('/session/:session_id', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const feedback = await SessionFeedback.findOne({ session_id });

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.json({ success: true, data: feedback });
  } catch (error: any) {
    console.error('Error fetching session feedback:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch session feedback', error: error.message });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import SessionMetrics from '../models/SessionMetrics';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const existingMetrics = await SessionMetrics.findOne({ session_id: req.body.session_id });

    if (existingMetrics) {
      const updatedMetrics = await SessionMetrics.findOneAndUpdate(
        { session_id: req.body.session_id },
        { ...req.body, calculated_at: new Date() },
        { new: true }
      );
      return res.json({ success: true, data: updatedMetrics, updated: true });
    }

    const metrics = new SessionMetrics(req.body);
    const savedMetrics = await metrics.save();
    res.status(201).json({ success: true, data: savedMetrics, updated: false });
  } catch (error: any) {
    console.error('Error creating session metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to create session metrics', error: error.message });
  }
});

router.get('/session/:session_id', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const metrics = await SessionMetrics.findOne({ session_id });

    if (!metrics) {
      return res.status(404).json({ success: false, message: 'Metrics not found' });
    }

    res.json({ success: true, data: metrics });
  } catch (error: any) {
    console.error('Error fetching session metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch session metrics', error: error.message });
  }
});

export default router;

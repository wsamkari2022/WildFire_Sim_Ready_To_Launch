import { Router, Request, Response } from 'express';
import UserSession from '../models/UserSession';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const userSession = new UserSession(req.body);
    const savedSession = await userSession.save();
    res.status(201).json({ success: true, data: savedSession });
  } catch (error: any) {
    console.error('Error creating user session:', error);
    res.status(500).json({ success: false, message: 'Failed to create user session', error: error.message });
  }
});

router.put('/:session_id', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const updatedSession = await UserSession.findOneAndUpdate(
      { session_id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedSession) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, data: updatedSession });
  } catch (error: any) {
    console.error('Error updating user session:', error);
    res.status(500).json({ success: false, message: 'Failed to update user session', error: error.message });
  }
});

router.get('/:session_id', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const session = await UserSession.findOne({ session_id });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, data: session });
  } catch (error: any) {
    console.error('Error fetching user session:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user session', error: error.message });
  }
});

export default router;

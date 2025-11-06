import { Router, Request, Response } from 'express';
import ScenarioInteraction from '../models/ScenarioInteraction';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const interaction = new ScenarioInteraction(req.body);
    const savedInteraction = await interaction.save();
    res.status(201).json({ success: true, data: savedInteraction });
  } catch (error: any) {
    console.error('Error creating scenario interaction:', error);
    res.status(500).json({ success: false, message: 'Failed to create scenario interaction', error: error.message });
  }
});

router.get('/session/:session_id', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const interactions = await ScenarioInteraction.find({ session_id }).sort({ createdAt: 1 });
    res.json({ success: true, data: interactions });
  } catch (error: any) {
    console.error('Error fetching scenario interactions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch scenario interactions', error: error.message });
  }
});

router.get('/session/:session_id/scenario/:scenario_id', async (req: Request, res: Response) => {
  try {
    const { session_id, scenario_id } = req.params;
    const interactions = await ScenarioInteraction.find({
      session_id,
      scenario_id: parseInt(scenario_id)
    }).sort({ createdAt: 1 });
    res.json({ success: true, data: interactions });
  } catch (error: any) {
    console.error('Error fetching scenario interactions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch scenario interactions', error: error.message });
  }
});

export default router;

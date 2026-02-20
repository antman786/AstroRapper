const { Router } = require('express');
const { validateNatalInput, validateTransitInput, buildTransitArgs, runAstrolog, ValidationError } = require('../services/astrolog');

const router = Router();

router.post('/', async (req, res) => {
  try {
    if (!req.body.natal) {
      return res.status(400).json({ success: false, error: 'natal object is required' });
    }
    if (!req.body.transit) {
      return res.status(400).json({ success: false, error: 'transit object is required' });
    }
    const natal = validateNatalInput(req.body.natal);
    const transit = validateTransitInput(req.body.transit);
    const args = buildTransitArgs(natal, transit);
    const output = await runAstrolog(args);
    res.json({
      success: true,
      command: `astrolog ${args.join(' ')}`,
      output,
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ success: false, error: err.message });
    }
    const status = err.message.includes('not found') ? 503
      : err.message.includes('timed out') ? 504
      : err.message.includes('Astrolog error') ? 502
      : 500;
    res.status(status).json({ success: false, error: err.message });
  }
});

module.exports = router;

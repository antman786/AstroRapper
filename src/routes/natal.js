const { Router } = require('express');
const { validateNatalInput, buildNatalArgs, runAstrolog, ValidationError } = require('../services/astrolog');

const router = Router();

router.post('/', async (req, res) => {
  try {
    const natal = validateNatalInput(req.body);
    const args = buildNatalArgs(natal);
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

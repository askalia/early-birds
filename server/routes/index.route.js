import express from 'express';
import catalogRoutes from './catalog.route'

const router = express.Router(); // eslint-disable-line new-cap

router.use('/catalog', catalogRoutes)
/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

export default router;

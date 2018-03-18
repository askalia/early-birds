import express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';

import catalogRoutes from './catalog.route'

import imageRoutes from './image.route'

const router = express.Router(); // eslint-disable-line new-cap

router.use('/catalog', catalogRoutes)
router.use('/image', imageRoutes)

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount user routes at /users
router.use('/users', userRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

export default router;

import express from 'express';
import imageCtrl from '../controllers/image.ctrl';

const router = express.Router();

router.route('/main-color').get(imageCtrl.getImageMainColor)

export default router;
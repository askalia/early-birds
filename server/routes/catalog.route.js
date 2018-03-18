import express from 'express';
import paramValidation from '../../config/param-validation';
import catalogCtrl from '../controllers/catalog.ctrl';

const router = express.Router();

router.route('/import').post(catalogCtrl.import)

export default router;
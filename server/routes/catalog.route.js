import express from 'express';
import catalogCtrl from '../controllers/catalog.ctrl';

const router = express.Router();

router.route('/import').post(catalogCtrl.importCatalog)
router.route('/update/colors').get(catalogCtrl.updateColors)
router.route('/recommend/by-color').get(catalogCtrl.getProductsRecommendations)

export default router;
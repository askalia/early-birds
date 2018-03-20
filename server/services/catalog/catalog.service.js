import saveCollection from './import-catalog/save-collection.mixin' 
import importCatalog from './import-catalog/import-catalog.mixin'
import validatePhotoUrl from './import-catalog/validate-photo-url.mixin'

import updateColors from './update-colors/update-colors.mixin'

import getProductsRecommendations from './recommend-products/products-recommendations.mixin'


export default {
    importCatalog,
    saveCollection,
    getProductsRecommendations,
    validatePhotoUrl,
    updateColors,
}
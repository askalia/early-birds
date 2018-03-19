import saveCollection from './import-catalog/save-collection.mixin' 
import importCatalog from './import-catalog/import-catalog.mixin'
import validatePhotoUrl from './import-catalog/validate-photo-url.mixin'

import updateColors from './update-colors/update-colors.mixin'
import getProductsColorless from './update-colors/get-products-colorless.mixin'

export default {
    importCatalog,
    saveCollection,
    getProductsColorless,
    validatePhotoUrl,
    updateColors,
}
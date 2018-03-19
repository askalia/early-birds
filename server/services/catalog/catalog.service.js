import saveCollection from './import-catalog/save-collection.ctrl-mixin' 
import importCatalog from './import-catalog/import-catalog.ctrl-mixin'
import validatePhotoUrl from './import-catalog/validate-photo-url.ctrl-mixin'

import updateColors from './update-colors/update-colors.ctrl-mixin'
import getProductsColorless from './update-colors/get-products-colorless.ctrl-mixin'

export default {
    importCatalog,
    saveCollection,
    getProductsColorless,
    validatePhotoUrl,
    updateColors,
}
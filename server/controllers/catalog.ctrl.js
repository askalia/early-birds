import httpcodes from 'http-codes'

import catalogService from '../services/catalog/catalog.service'
import { onImportCatalogSuccess, onImportCatalogFailed} from './catalog/import-callbacks'

const importCatalog = (request, response) => {
    
    onImportCatalogSuccess.response = onImportCatalogFailed.response = response;
    const { url } = request.body;
    
    catalogService.importCatalog({ 
        url, 
        onSuccess : onImportCatalogSuccess, 
        onFailed: onImportCatalogFailed 
    })
}

const updateColors = (request, response) => {
    catalogService.updateColors()
        .then(results => response.status(httpcodes.OK).json(results))
}

const getProductsRecommendations = (request, response) => {
    const { color, tolerance } = request.query
    catalogService.getProductsRecommendations(color, tolerance)
        .then(products_recommended => response.status(httpcodes.OK).json({ products_recommended }))
        .catch(err => response.status(httpcodes.BAD_REQUEST).json({err}))
}

export default {
    importCatalog,
    updateColors,
    getProductsRecommendations
}
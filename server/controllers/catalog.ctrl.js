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

export default {
    importCatalog,
    updateColors
}
function onImportCatalogSuccess({productsToSave }){
    
    onImportCatalogSuccess.response
    .status(httpcodes.CREATED)
    .json({ 
        done : true, 
        imports : productsToSave.length 
    })
    
}
onImportCatalogSuccess.response = null

function onImportCatalogFailed({ err }) {
    
    onImportCatalogFailed.response
    .status(httpcodes.INTERNAL_SERVER_ERROR)
    .json({ 
        done : false, 
        message : (err || {}).message || '', 
        imports : 0 
    })
    
    
}
onImportCatalogFailed.response = null 

export default {
    onImportCatalogSuccess,
    onImportCatalogFailed
}
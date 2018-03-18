import csv from 'csv-stream'
import request from 'request'
import axios from 'axios'
import http from 'http'
import httpcodes from 'http-codes'
import url from 'url'

import Product from '../models/product.model'
import catalogService from '../services/catalog.service'

const importCatalog = (request, response) => {

    onImportSuccess.response = onImportFailed.response = response;
    const { url } = request.body;
    
    catalogService.importCatalog({ 
        url, 
        onSuccess : onImportSuccess, 
        onFailed: onImportFailed 
    })
}

function onImportSuccess({productsToSave }){
    
    onImportSuccess.response
            .status(httpcodes.CREATED)
            .json({ 
                done : true, 
                imports : productsToSave.length 
            })
           
}
onImportSuccess.response = null

function onImportFailed({ err }) {
    
    onImportFailed.response
            .status(httpcodes.INTERNAL_SERVER_ERROR)
            .json({ 
                done : false, 
                message : (err || {}).message || '', 
                imports : 0 
            })
    
        
}
onImportFailed.response = null 

export default {
    import : importCatalog
}
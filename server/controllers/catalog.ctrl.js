import csv from 'csv-stream'
import request from 'request'
import axios from 'axios'
import http from 'http'
import httpcodes from 'http-codes'
import url from 'url'
import Product from '../models/product.model'

import productsService from '../services/products.service'
import catalogCtrlOptions from './catalog/catalog.config'

const importCatalog = (request, response) => {

    onImportSuccess.response = response;
    onImportFailed.response = response;
    onUrlUnreachable.response = response

    const url = request.body.url
    checkCsvFileUrl( url )
        .then(() => doImport(url) )
        .catch(err => onUrlUnreachable({err, url}) )
}

const doImport = (url) => {
  
    let productsCollection = []

    getStreamCSV( url )
        .on('error', (err) => onCsvStreamErrorEvent(err) )
        .on('data',  (product) => onCsvStreamDataEvent( {product, productsCollection} ) )
        .on('end',   () => onCsvStreamEndEvent(productsCollection ) )
}

const getStreamCSV = (url) => {
    const csvStream = csv.createStream( catalogCtrlOptions );
    return request(decodeURIComponent(url))
            .pipe(csvStream)
}

const checkCsvFileUrl = (url) => {
    return axios.head(url)           
}

function onUrlUnreachable({err, url}){
    onUrlUnreachable.response
        .status(httpcodes.BAD_REQUEST)
        .send(`importCatalog : CSV file URL unreachable : ${url}, ${err}`)
}
onUrlUnreachable.response = null;

const onCsvStreamErrorEvent = (err) => {
    console.error(err);
}

const onCsvStreamDataEvent = ({product, productsCollection}) => {

    if (typeof product !== 'object'){
        console.log(`onCsvStreamDataEvent : ERR : product is not a object : (${typeof product}) ${product}`)
        return false
    }

    productsCollection.push(product)
    
}

const onCsvStreamEndEvent = (productsCollection) => {
    
    fetchCacheProducts()
        .then(cacheProducts => persistProducts({ cacheProducts, productsCollection }))
}

const persistProducts = ({ cacheProducts, productsCollection }) => {

    Promise
        .all( validateProducts({ cacheProducts, productsCollection }) )
        .then(productsPhotosValidations => {
            const productsToSave = productsPhotosValidations
                                    .filter( item => item.isValid ===true)
                                    .map(item => item.product)
    
            if (productsToSave.length >0){
                productsService
                    .saveCollection(productsToSave)
                    .then(() => onImportSuccess({productsToSave}))
                    .catch((err) => onImportFailed({err}))     
            }
            else {
                onImportFailed({ err: null })
            }
            
        })
}

const validateProducts = ({ cacheProducts, productsCollection }) => {

    const asyncTasks = []
    productsCollection.forEach(product => {
        if (! cacheProducts.has(product.id)){
            asyncTasks.push(
                process.env.ENABLE_VALIDATE_PHOTO_URL === true
                    ? productsService.validatePhotoUrl(product)
                    : new Promise(resolve => resolve({ product, isValid: true }))
            )
        }        
    })

    return asyncTasks
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

const fetchCacheProducts = () => {
    
    return Product.find()
        .select('id')
        .limit(500)
        .exec()
        .then((rawList) => {
            const cacheProducts = new Set()
            rawList.forEach(pdt => {
                cacheProducts.add(pdt.id.trim())
            })
            return cacheProducts
        })
}


export default {
    import : importCatalog
}
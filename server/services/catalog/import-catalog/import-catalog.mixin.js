import csv from 'csv-stream'
import request from 'request'
import axios from 'axios'
import http from 'http'
import httpcodes from 'http-codes'

import Product from '../../../models/product.model'
import validatePhotoUrl from './validate-photo-url.mixin'
import saveCollection from './save-collection.mixin'

import catalogCtrlOptions from './config/import-catalog.config'

const importCatalog =({ url, onSuccess, onFailed }) => {

    if (typeof onSuccess !== 'function' || typeof onFailed !=='function'){
        throw new Error('success and failed callbacks are expected to be functions')
    }
    persistProducts.onSuccess = onSuccess
    persistProducts.onFailed = onFailed

    return checkCsvFileUrl( url )
        .then(() => doImport(url) )
        .catch(err => onUrlUnreachable({err, url}) )
}


const doImport = (url) => {
  
    let productsCollection = []
    getStreamCSV( url )
        .on('error', (err) => onCsvStreamErrorEvent(err) )
        .on('data',  (product) => onCsvStreamDataEvent( {product, productsCollection} ) )
        .on('end',   () => onCsvStreamEndEvent( productsCollection ) )
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

function persistProducts({ cacheProducts, productsCollection }){

    Promise
    .all( validateProducts({ cacheProducts, productsCollection }) )
    .then(productsPhotosValidations => {
        const productsToSave = productsPhotosValidations
                                .filter( item => item.isValid ===true)
                                .map(item => {
                                    item.product.main_color = ''
                                    return item.product
                                })

        if (productsToSave.length >0){
            saveCollection(productsToSave)
                .then(() => persistProducts.onSuccess({productsToSave}))
                .catch((err) => persistProducts.onFailed({err}))     
        }
        else {
            persistProducts.onFailed({ err : { message : 'All products in the catalog were previous imported. Operation cancelled' }})
        }  
    })
}
persistProducts.onSuccess = null
persistProducts.onFailed = null


const validateProducts = ({ cacheProducts, productsCollection }) => {
    const asyncTasks = []
    productsCollection.forEach(product => {
        if (! cacheProducts.has(product.id)){
            asyncTasks.push(
                process.env.ENABLE_VALIDATE_PHOTO_URL === true
                    ? validatePhotoUrl(product)
                    : new Promise(resolve => resolve({ product, isValid: true }))
            )
        }        
    })
    return asyncTasks
}

/**
 * @TODO current implementation is unscalable, and should be optimized this way :
 * 1. collect all CSV items
 * 2. set a collection of all items IDs (ID gotten from CSV, not mongo _id)
 * 3. ask for all products IN(collection)
 */
const fetchCacheProducts = () => {
    
    return Product.find()
        .select('id')
        .limit(0)
        .exec()
        .then((rawList) => {
            const cacheProducts = new Set()
            rawList.forEach(pdt => {
                cacheProducts.add(pdt.id.trim())
            })
            return cacheProducts
        })
}

export default importCatalog
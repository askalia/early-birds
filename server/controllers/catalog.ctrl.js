import csv from 'csv-stream'
import request from 'request'
import axios from 'axios'
import http from 'http'
import httpcodes from 'http-codes'
import url from 'url'

import productsService from '../services/products.service'
import catalogCtrlOptions from './catalog/catalog.config'

let collectionToSave = []
let asyncTasks = []

const importCatalog = (request, response) => {

    const url = request.body.url
    
    checkCsvFileUrl( url )
        .then(() => doImport({url, response }) )
        .catch(err => onUrlUnreachable({err, url, response }) )
}

const doImport = ({ url, response }) => {
  
    getStreamCSV( url )
        .on('error', (err) => onCsvStreamErrorEvent(err) )
        .on('data',  (product) => onCsvStreamDataEvent(product) )
        .on('end',   () => onCsvStreamEndEvent(response) )
}

const getStreamCSV = (url) => {
    const csvStream = csv.createStream( catalogCtrlOptions );
    return request(decodeURIComponent(url))
            .pipe(csvStream)
}

const checkCsvFileUrl = (url) => {
    return axios.head(url)           
}

const onUrlUnreachable = ({err, url, response }) => {
    response.status(httpcodes.BAD_REQUEST).send(`importCatalog : CSV file URL unreachable : ${url}, ${err}`)
}

const onCsvStreamErrorEvent = (err) => {
    console.error(err);
}

const onCsvStreamDataEvent = (product) => {

    if (typeof product !== 'object'){
        console.log(`onCsvStreamDataEvent : ERR : product is not a object : (${typeof product}) ${product}`)
        return false
    }

    asyncTasks.push(validateProductPhoto(product)
        .then(() => {
            collectionToSave.push(product) 
        })
        .catch(err => console.log('validateProductPhoto: ERR :', err))
    )
       
}

const onCsvStreamEndEvent = (response) => {
    
    Promise.all(asyncTasks).then((results) => {
        console.log('Import all done : ', collectionToSave.length)
        productsService
            .saveCollection(collectionToSave)
            .then(() => onImportSuccess(response))
            .catch((err) => onImportFailed({err , response}))     
    })
}

const validateProductPhoto = (product) => {
    return process.env.ENABLE_VALIDATE_PHOTO_URL === true
                ? productsService.validatePhotoUrl(product)
                : new Promise(resolve => resolve())
}

const onImportSuccess = (response) => {
    const message = `catalog:import: JOB FINISHED : ${(collectionToSave.length).toString()} products imported`;
    resetContext()
    response.status(httpcodes.CREATED).json({ message })
}

const onImportFailed = ({ err, response }) => {
    const message = `catalog:import: JOB FAILED : ${err.message}`
    resetContext()
    response.status(httpcodes.INTERNAL_SERVER_ERROR).json({ message } )
} 

const resetContext = () => {
    collectionToSave = []
    asyncTasks = []
}

export default {
    import : importCatalog
}
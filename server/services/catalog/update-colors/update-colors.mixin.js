import async from 'async'
import parallel from 'async/parallel'
const sequence = require('promise-sequence');

import Product from '../../../models/product.model'
import getProductsColorless from './get-products-colorless.mixin'
import googleVisionService  from '../../../services/google-vision.service'

const updateColors = ({ limit }) => {
    
    let dbProducts
    return getProductsColorless({ limit })
        .then( queueCallsToVisionAPI )
        .then( persistsCatalogColors )        
} 

const queueCallsToVisionAPI = (dbProducts) => {
     
    if (dbProducts.length === 0){
        return new Promise((resolve, reject) => reject(new Error('All products are already assigned their dominant color')) )
        
    }
    const maxItemsPerSilot = process.env.GOOGLE_VISION_MAX_ITEMS_PER_REQUEST
    const nbSilots = Math.ceil(dbProducts.length/maxItemsPerSilot)
    let leftOffset = 0
    const visionCallSeries = []

    // to each task its own callback
    const asyncCallFactory = (leftOffset) => {
        return () => {
            return new Promise(resolve => {
                // we timeout the promise resolution -> to add a delay between every call that  avoids flooding Vision API
                // this version of Vision API deals bad with calls in mass. May this issue be fixed with latest version
                setTimeout(() => {
                    resolve( googleVisionService.lookupImagesColorOf({
                        // we make a copy of dbProduct before we slice it, to preserve the original (mutation VS alteration)
                        productsList : [...dbProducts].splice(leftOffset, maxItemsPerSilot),
                        format: process.env.GOOGLE_VISION_COLOR_FORMAT_HEXA
                    }))
                }, +process.env.GOOGLE_VISION_DELAY_BETWEEN_EACH_CALL)
                // the given delay value above is one with which we obtain the least loss of broken photo-URL calls from Vision API
            })
        }
    }

    // Because Vision API can't manage more than X items par request, we split the wholeset into silots
    for (let idxSilot = 0; idxSilot < nbSilots; idxSilot ++){   
        visionCallSeries.push( asyncCallFactory(leftOffset) )
        leftOffset += parseInt(maxItemsPerSilot)     
    }

    // we run every call as a sequence to care the timeout between calls
    return sequence(visionCallSeries)            
            .then((colorResults) => ({ colorResults, dbProducts }) )
}


const persistsCatalogColors = ({ colorResults, dbProducts }) => {
    
    const productCollectionToPersist = []
    let orderProduct = 0
    let nbFailed = 0
    let nbSucceed = 0

    // we prepare collection of products to be updated to DB
    colorResults.forEach(silot => {
        silot.forEach(node => {
            node.responses.forEach(entry => {
                // we focus only on 'imageProprties' data
                if (entry.imagePropertiesAnnotation){
                    ++ nbSucceed 
                    let color = entry.imagePropertiesAnnotation.dominantColors.colors[0].color
                    productCollectionToPersist.push({
                        id: dbProducts[orderProduct]._id,
                        main_color: googleVisionService.formatColor(color, 'HEXA')
                    })
                }                
                else {
                    // we highlight annotations failures
                    ++ nbFailed
                    console.log('FAILED : ', dbProducts[orderProduct].photo, JSON.stringify(entry))
                }
                ++ orderProduct;
            })
        })
    })

    console.log('TOTAL FAILED : ', nbFailed)

    console.log('TOTAL SUCCEED : ', nbSucceed)

    return updateDatabase(productCollectionToPersist)
}

const updateDatabase = (productCollectionToPersist) => {

    const updateSeries = productCollectionToPersist.map(({ id, main_color}, idx) => (callback) => {
        //let { id, main_color } = colorResult
        Product.update(
            { _id: id}, 
            { $set: { main_color }}, 
            null, 
            () => callback(null, idx) 
        )
    })
    
    // matter of DB and I/O : we free main thread and create async workers
    // async concats every Promise response. 
    // When all workers are done, async push'em to a callback, fulfills one single resolver with the wholet, ready to be returned
    return new Promise(resolve => {
        async.parallel(
            updateSeries, 
            () => resolve({ products_with_color: productCollectionToPersist })
        )
    })
}

export default updateColors
import async from 'async'
import parallel from 'async/parallel'
const sequence = require('promise-sequence');

import Product from '../../../models/product.model'
import catalogService from '../catalog.service'
import googleVisionService  from '../../../services/google-vision.service'

const updateColors = () => {
    
    let dbProducts
    return catalogService.getProductsColorless(40)
        .then(dbProducts => queueCallsToVisionAPI(dbProducts) )
        .then(({ colorResults, dbProducts }) => taskUpdateCatalogColors({ colorResults, dbProducts }))        
} 

const queueCallsToVisionAPI = (dbProducts) => {
     
    const maxItemsPerSilot = process.env.GOOGLE_VISION_MAX_ITEMS_PER_REQUEST
    const nbSilots = Math.ceil(dbProducts.length/maxItemsPerSilot)
    const visionCallsPromises = []
    let leftBound = 0
    let colorResults = []
    const visionCallSeries = []

    const asyncCallFactory = (leftBound) => {
        return () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve( googleVisionService.lookupImagesColorOf({
                        productsList : [...dbProducts].splice(leftBound, maxItemsPerSilot),
                        format: process.env.GOOGLE_VISION_COLOR_FORMAT_HEXA
                    }))
                }, 5000)
            })
        }
    }

    for (let idxSilot = 0; idxSilot < nbSilots; idxSilot ++){   
        visionCallSeries.push( asyncCallFactory(leftBound) )
        leftBound += parseInt(maxItemsPerSilot)     
    }

    return sequence(visionCallSeries)            
            .then((colorResults) => ({ colorResults, dbProducts }) )
}


const taskUpdateCatalogColors = ({ colorResults, dbProducts }) => {
    
    const jsonRes = []
    let orderProduct = 0
    let nbFailed = 0
    let nbSucceed = 0

    // we iterae over silots of annoations
    colorResults.forEach(silot => {
        silot.forEach(node => {
            node.responses.forEach(entry => {
                // we focus only on 'imageProprties' data
                if (entry.imagePropertiesAnnotation){
                    ++ nbSucceed 
                    let color = entry.imagePropertiesAnnotation.dominantColors.colors[0].color
                    jsonRes.push({
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

    const updateSeries = jsonRes.map(({ id, main_color}, idx) => (callback) => {
        //let { id, main_color } = colorResult
        Product.update(
            { _id: id}, 
            { $set: { main_color }}, 
            null, 
            () => callback(null, idx) )
    })
    
    // matter of DB and I/O : we free main thread and create async workers
    // async holds Promise's resolution til all workers are done
    return new Promise(resolve => {
        async.parallel(
            updateSeries, 
            () => resolve({ products_with_color: jsonRes })
        )
    })
}

export default updateColors
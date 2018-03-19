import async from 'async'
import parallel from 'async/parallel'
import rgbHex from 'rgb-hex'

import Product from '../../../models/product.model'
import catalogService from '../catalog.service'
import googleVisionService  from '../../../services/google-vision.service'

const updateColors = () => {
    
    let dbProducts
    return catalogService.getProductsColorless(499)
        .then(_dbProducts => {
            dbProducts = _dbProducts
            return queueCallsToVisionAPI(_dbProducts)
        })
        .then(colorResults => taskUpdateCatalogColors({ colorResults, dbProducts }))        
} 

const queueCallsToVisionAPI = (dbProducts) => {
     
    const maxItemsPerSilot = process.env.GOOGLE_VISION_MAX_ITEMS_PER_REQUEST
    const nbSilots = Math.ceil(dbProducts.length/maxItemsPerSilot)
    const visionCallsPromises = []
    let leftBound = 0
    let rightBound = 0

    for (let idxSilot = 0; idxSilot < nbSilots; idxSilot ++)
    {                               
        visionCallsPromises.push(
            googleVisionService.getMainColorOf({
                productsList : [...dbProducts].splice(leftBound, maxItemsPerSilot),
                format: process.env.GOOGLE_VISION_COLOR_FORMAT_HEXA
            })
        )
        leftBound += parseInt(maxItemsPerSilot)                     
    }
    return Promise.all(visionCallsPromises)     
}


const taskUpdateCatalogColors = ({ colorResults, dbProducts }) => {
    
    const jsonRes = []
    let counter = 0

    console.log('colorResults : ' , colorResults)

    colorResults.forEach(silot => {
        silot[0].responses
            .forEach(entry => {
                if (entry.imagePropertiesAnnotation){
                    console.log('entry img anno : ', JSON.stringify(entry))
                    let color = entry.imagePropertiesAnnotation.dominantColors.colors[0].color
                    jsonRes.push({
                        id: dbProducts[counter]._id,
                        main_color: getColorFormatted(color, 'HEXA')
                    })
                }                
                ++ counter;
                
            })   
    })
    
    const updateSeries = jsonRes.map(({ id, main_color}, idx) => (callback) => {
        //let { id, main_color } = colorResult
        Product.update({ _id: id}, { $set: { main_color }}, null, () => callback(null, idx) )
    })
    
    return new Promise(resolve => {
        async.parallel(
            updateSeries, 
            () => resolve({ products_with_color: jsonRes })
        )
    })
}

const getColorFormatted = (colorObj, format = null) => {
    
    const HEXA_alikeFormats = [undefined, null, process.env.GOOGLE_VISION_COLOR_FORMAT_HEXA, process.env.GOOGLE_VISION_COLOR_FORMAT_DEFAULT]

    if (HEXA_alikeFormats.indexOf(format) > -1){
        const { red, green, blue } = colorObj
        return '#'+rgbHex(+red, +green, +blue)
    }
    else if (format === process.env.GOOGLE_VISION_COLOR_FORMAT_RGB){
        return colorObj
    }
    return {  err : { message : `Format ${format.toUpperCase()} is not supported` } }  
}

export default updateColors
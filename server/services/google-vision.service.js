import rgbHex from 'rgb-hex'
import path from 'path'
import vision from '@google-cloud/vision'
import urlParser from 'url'

const visionConfig = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: path.join(__dirname,  '/../../', process.env.GOOGLE_CLOUD_KEY_FILENAME)
  }

const lookupImagesColorOf = ({ productsList, format = process.env.GOOGLE_VISION_COLOR_DEFAULT_FORMAT }) => {

    console.log('nb products to lookup : ', productsList.length)
    return vision(visionConfig)
            .batchAnnotateImages( requestsFactory(productsList) )
}

const requestsFactory = (productsList) => {
    return productsList.map(product => ({
        image : { 
            source : { 
                imageUri : sanitizeUrl(product.photo)
            }
        },
        features : {
            type : getRequestAnnotationType()
        }
    }))
}

const sanitizeUrl = (url) => {
    let sanitizeUrl = '' + decodeURIComponent(url)
    if (urlParser.parse(url).protocol === null){
        // grab protocol from product.url's which is FQDN URL
        sanitizeUrl = 'https:' + sanitizeUrl
    }
    return sanitizeUrl
}

const getRequestAnnotationType = () => {
    return vision.v1.types.Feature.Type[process.env.GOOGLE_VISION_REQUEST_ANNOTATION_TYPE]
}

const formatColor = (colorObj, format = process.env.GOOGLE_VISION_COLOR_FORMAT_DEFAULT) => {
    
    const HEXA_alikeFormats = [undefined, null, process.env.GOOGLE_VISION_COLOR_FORMAT_HEXA]

    if (HEXA_alikeFormats.indexOf(format) > -1){
        const { red, green, blue } = colorObj
        return '#'+rgbHex(+red, +green, +blue)
    }
    else if (format === process.env.GOOGLE_VISION_COLOR_FORMAT_RGB){
        return colorObj
    }
    return {  err : { message : `Format ${format.toUpperCase()} is not supported` } }  
}

export default {
    lookupImagesColorOf,
    formatColor
}
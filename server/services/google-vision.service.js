import rgbHex from 'rgb-hex'
import path from 'path'
import vision from '@google-cloud/vision'
import urlParser from 'url'

const visionConfig = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: path.join(__dirname,  '/../../../', process.env.GOOGLE_CLOUD_KEY_FILENAME)
  }

  ///const visionClient = new vision.ImageAnnotatorClient(visionConfig)

const getMainColorOf = ({ productsList, format = process.env.GOOGLE_VISION_COLOR_DEFAULT_FORMAT }) => {

    console.log('nb products to lookup : ', productsList.length)
    const requests = productsList.map(product => ({
        image : { 
            source : { 
                imageUri : sanitizeUrl(decodeURIComponent(product.photo))
            }
        },
        features : {
            type : vision.v1.types.Feature.Type.IMAGE_PROPERTIES
        }
    }))
    
    //console.log('requests : ', JSON.stringify(requests))
    return vision(visionConfig)
        //.imageProperties(url)
        .batchAnnotateImages(requests)
        //.then(results => handleColorResults({ productsList, results, format }))
        //.catch(err => {
            //console.error('ERROR:', err);
        //})

}

const handleColorResults = ({ productsList, results, format }) => {

    console.log('BATCH RESULST : ', JSON.stringify(results));

    return
    /*
    const jsonRes = []
    results[0].responses
        .forEach((entry , idx) => {
            let color = entry.imagePropertiesAnnotation.dominantColors.colors[0].color
            jsonRes.push({
                id: productsList[idx]._id,
                main_color: getColorFormatted(color, format)
            })
        })

        console.log('jsonRes : ', jsonRes)
    return jsonRes
    */
    
}

const sanitizeUrl = (url) => {
    let sanitizeUrl = '' + url.split('?')[0]
    if (urlParser.parse(url).protocol === null){
        // grab protocol from product.url's which is FQDN URL
        sanitizeUrl = 'https:' + sanitizeUrl
    }
    return sanitizeUrl
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

export default {
    getMainColorOf
}
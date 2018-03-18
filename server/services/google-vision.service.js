import rgbHex from 'rgb-hex'
import path from 'path'
import vision from '@google-cloud/vision'

var config = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: path.join(__dirname,  '/../../../', process.env.GOOGLE_CLOUD_KEY_FILENAME)
  }

const visionClient = new vision.ImageAnnotatorClient(config)
  
const getImageMainColor = ({ url, format }) => {
    return visionClient
        .imageProperties(url)
        .then(results => {
            const properties = results[0].imagePropertiesAnnotation;            
            return {
                main_color: getColorFormatted(properties.dominantColors.colors[0].color, format)
            }
        })
        .catch(err => {
            console.error('ERROR:', err);
        });

}

const getColorFormatted = (colorObj, format = null) => {
    
    if (! format || format === null || /HEX/gi.test(format)){
        const { red, green, blue } = colorObj
        return '#'+rgbHex(+red, +green, +blue)
    }
    else if (/RGBA?/gi.test(format)){
        return colorObj
    }
    else {
        return { 
            err : {
                message : `Format ${format.toUpperCase()} not supported` 
            }
        }
    }
    
}

export default {
    getImageMainColor
}
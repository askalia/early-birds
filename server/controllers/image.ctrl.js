import urlParser from 'url'
import googleVisionService  from '../services/google-vision.service'

const getImageMainColor = (request, response) => {

    let { url, format } = request.query
    url = sanitizeUrl(decodeURIComponent(url))

    googleVisionService.getImageMainColor({url, format})
        .then((result) => {
            response.status(200).json(result)
        })
} 


const sanitizeUrl = (url) => {
    let sanitizeUrl = '' + url
    if (urlParser.parse(url).protocol === null){
        // grab protocol from product.url's which is FQDN URL
        sanitizeUrl = 'https:' + url
    }
    return sanitizeUrl
}

export default {
    getImageMainColor
}
import async from 'async'
import parallel from 'async/parallel'

import Product from '../../../models/product.model'
import catalogService from '../catalog.service'
import googleVisionService  from '../../../services/google-vision.service'

const updateColors = () => {
    
    return catalogService.getProductsColorless()
            .then(dbProducts => {
                return googleVisionService.getMainColorOf({
                    productsList : dbProducts,
                    format: process.env.GOOGLE_VISION_COLOR_FORMAT_HEXA
                })
            })
            .then(colorResults => taskUpdateCatalogColors(colorResults))        
} 

const taskUpdateCatalogColors = (colorResults) => {
    
    const updateSeries = colorResults.map((colorResult, idx) => (callback) => {
        let { id, main_color } = colorResult
        Product.update({ _id: id}, { $set: { main_color }}, null, () => callback(null, idx) )
    })
    
    return new Promise(resolve => {
        async.parallel(
            updateSeries, 
            () => resolve({ products_with_color: colorResults })
        )
    })
}

export default updateColors
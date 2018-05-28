const color_proximity = require('colour-proximity')

import Product from "../../../models/product.model";
import getProducts from './get-products.mixin'

const getProductsRecommendations = (color, tolerance = process.env.COLOR_PROXIMITY_TOLERANCE) => {
    return getProducts()
            .then(products => filterByColourProximity(products, color, +tolerance))
}

const filterByColourProximity = (products, color, tolerance) => {
    if (color[0] !== '#'){
        color = '#'+color
    }

    if (! validateColorFormat(color)){
        return new Promise(reject => reject(`Color format not supported : ${color}`))
    }

    if (validateColorFormat(color)){
        return products.filter(product => {
            return (color_proximity.proximity(color, product.main_color) <= tolerance)
        })
    }
    
    
}

const validateColorFormat = (color) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}

export default getProductsRecommendations
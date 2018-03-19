import Product from "../../../models/product.model";

const getProductsColorless = (limit = 5) => {
    return Product
            .find()
            .where({ 'main_color' : ''}).limit(limit)
            .exec()
}

export default getProductsColorless
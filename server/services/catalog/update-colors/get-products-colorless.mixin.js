import Product from "../../../models/product.model";

const getProductsColorless = ({ limit = 0 }) => {
    return Product
            .find()
            .where({ 'main_color' : ''}).limit(+limit)
            .exec()
}

export default getProductsColorless
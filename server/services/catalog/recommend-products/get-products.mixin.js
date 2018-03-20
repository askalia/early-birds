import Product from "../../../models/product.model";

const getProducts = () => {
    return Product
            .find()
            .select('-_id')
            .where({ 'main_color' : { $ne : '' } })
            .limit(0)
            .exec()
}

export default getProducts
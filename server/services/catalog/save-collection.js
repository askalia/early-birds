import Product from '../../models/product.model'

const saveCollection = (productsCollection) => {

    if (! Array.isArray(productsCollection)){
        throw new Error(`productCollection has not the type expected (Array) : ${typeof productsCollection}`)
    }
    if (productsCollection.length ===0){
        throw new Error('productCollection is empty. Nothing to import. JOB TERMINATED')
    }
    return Product.collection
        .insertMany(
            productsCollection
        )
}

export default saveCollection
import Product from '../models/product.model'
import axios from 'axios'

let _productsPersistCollection = []

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
        .then( () => _resetState() )
        .catch( () => _resetState() )
}

const getAllProducts = () => {
    return Product.find({})
}

const validatePhotoUrl = (product) => {
    const photoUrl = url.parse(product.photo).protocol === null ? url.parse(product.url).protocol + product.photo : product.photo
    return axios.head(photoUrl)    
}

const _resetState = () => {
    _productsPersistCollection = []
}

export default {
    saveCollection,
    validatePhotoUrl,
    getAllProducts
}
import url from 'url'

const validatePhotoUrl = (product) => {
    let photoUrl = product.photo

    if (url.parse(product.photo).protocol === null){
        // grab protocol from product.url's which is FQDN URL
        photoUrl = url.parse(product.url).protocol + product.photo
    }
    return axios.head(photoUrl)    
}

export default validatePhotoUrl
import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import validators  from 'mongoose-validators'
import axios from 'axios'


/**
* User Schema
*/
const ProductSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    gender_id: {
        type: String,
        required: true,
        validate: {
            validator: (value) =>{
                return /^(MAN|WOM)$/.test(value)
            },
            message: '{VALUE} is not a valid gender value!'
        }
    },
    composition: {
        type: String,
        required: true
    },
    sleeve: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true,
        validate: {
            validator: (value) =>{
                var pattern = new RegExp('^(\\/\\/)?'+ // protocol
                                    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
                                    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                                    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
                                    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                                    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
                pattern.test(value);
            },
            message: '{VALUE} is not a valid URL fragment'
        }

        
    },
    url: {
        type: String,
        required: true,
        validate: {
            validator: (value) =>{
                const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
                                    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
                                    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                                    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
                                    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                                    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
                return pattern.test(value);
            },
            message: '{VALUE} is not a valid URL'
        }
    },
    main_color: {
        type: String,
        required: false
    }
});

export default mongoose.model('Product', ProductSchema);

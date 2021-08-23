const jwt = require('jsonwebtoken');
const actions = require('../database/actions');

const ProductQueryOptions = {
    nombre: "nombre = :nombre",
    valor: "valor = :valor",
    foto: "foto = :foto",
}

function validateProductObject(productObject){
    let listProperties = Object.keys(ProductQueryOptions)
    let listUserProperties = Object.keys(productObject)
    let equalStruct = listProperties.every(property => listUserProperties.includes(property)) && listUserProperties.every(property => listProperties.includes(property))
    return equalStruct
}

module.exports.authProduct = (req,res,next) => {
    try {
        const product = req.body;
        if (!validateProductObject(product)){throw `No ingreso todos los campos validos, propiedades requeridas ${Object.keys(ProductQueryOptions)}`}
        return next();

    } catch (error) {
        res.status(422).json({
            success: false,
            messague: `campo no valido, ${error}`,
            data: req.body
        });
    }
}

module.exports.authProductObject = (req,res,next) => {
    try {
        const product = req.body;
        let valid_user_params = {};

        const product_keys = Object.keys(product);
        let queries= [];
        if (product_keys.length>0){
            product_keys.forEach(property => {
                if (property in ProductQueryOptions){
                    queries.push(ProductQueryOptions[property]);
                    valid_user_params[property] = product[property];
                }
            })
            if(queries.length === 0){throw "No hay parametros validos en la solicitud";}
            req.body = valid_user_params;
            req.queries = queries.join(', ');
            return next();
        }else {
            throw "No hay parametros validos en la solicitud";
        }
    } catch (error) {
        res.status(422).json({
            success: false,
            messague: `Unprocessable Entity , ${error}`,
            data: req.body
        })
    }
}
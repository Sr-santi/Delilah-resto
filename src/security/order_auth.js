const jwt = require('jsonwebtoken');
const actions = require('../database/actions');

const OrderQueryOptions = {
    tipoPago: "",
    IdUser: "",
    estado: ""
}

const OrderDetailQueryOptions = {
    idProducto: "",
    cant: ""
}

function checkEqual(object_1,object_2){
    return object_1.every(property => object_2.includes(property)) && object_2.every(property => object_1.includes(property))
}

function validateOrderObject(OrderObject){
    let listPropertiesOrder = Object.keys(OrderQueryOptions)
    let listUserProperties = Object.keys(OrderObject)
    let equalStruct = checkEqual(listPropertiesOrder,listUserProperties)
    return equalStruct
}
function validateDetailObject(DetailObject){
    let listPropertiesDetail = Object.keys(OrderDetailQueryOptions)
    let listUserProperties = Object.keys(DetailObject)
    let equalStruct = checkEqual(listPropertiesDetail,listUserProperties)
    return equalStruct
}

module.exports.authOrder = (req,res,next) => {
    try {
        let order = req.body["order"]
        let detailOrder = req.body["detalleOrder"]
        let validDetailOrder = []
        if (!validateOrderObject(order)){throw `No ingreso todos los campos validos en la propiedad order, propiedades requeridas ${Object.keys(OrderQueryOptions)}`}
        if(req.isAdmin === false){
            order["IdUser"] = req.userId
            console.log(req.userId)
        }
        detailOrder.forEach(element => {
            if(validateDetailObject(element)){validDetailOrder.push(element)}
        })
        if(validDetailOrder.length === 0){throw `No ingreso todos los campos validos en la propiedad detalleOrder, propiedades requeridas ${Object.keys(OrderDetailQueryOptions)}`}
        req.body["detalleOrder"]=validDetailOrder
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
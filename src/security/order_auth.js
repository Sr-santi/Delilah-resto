const jwt = require('jsonwebtoken');
const actions = require('../database/actions');

const validStatus = [1,2,3,4,5,6];


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

module.exports.authOrder = async (req,res,next) => {
    try {
        let order = req.body["order"]
        let detailOrder = req.body["detalleOrder"]
        let validDetailOrder = []
        if (!validateOrderObject(order)){throw `No ingreso todos los campos validos en la propiedad order, propiedades requeridas ${Object.keys(OrderQueryOptions)}`}
        if (!(order.tipoPago === 1 || order.tipoPago === 0)){throw `Tipo de pago debe ser 0 o 1 , 0 == efectivo , 1 == tarjeta de credito`}
        if (!(validStatus.includes(order.estado))){throw `Estado de orden no valido, valores validos: ${validStatus}`}

        if(req.isAdmin === false){
            order["IdUser"] = req.userId
            console.log(req.userId)
        }
        detailOrder.forEach(element => {
            if(validateDetailObject(element)){validDetailOrder.push(element)}
        })
        if(validDetailOrder.length === 0){throw `No ingreso todos los campos validos en la propiedad detalleOrder, propiedades requeridas ${Object.keys(OrderDetailQueryOptions)}`}
        req.body["detalleOrder"]=validDetailOrder

        product_exist = await actions.Select('SELECT * FROM producto WHERE id = :id', { id: validDetailOrder[0].idProducto });
        if(product_exist.length === 0){throw `id de producto no valido, verifique que este producto exista en la base de datos`}
        return next();

    } catch (error) {
        res.status(422).json({
            success: false,
            messague: `campo no valido, ${error}`,
            data: req.body
        });
    }
}

module.exports.authOrderStatus = async (req,res,next) => {
    try {
        const userStatus = req.body;
        let existOrder = true;
        const validation = validStatus.includes(userStatus.estado)
        if (!validation){throw `Body no valido, ingrese un estado valido dentro de las opciones ${validStatus}`;}

        exist = await actions.Select('SELECT * FROM ordenes WHERE id = :id', { id: req.params.id });
        if (exist.length === 0) {
            existOrder = false;
            throw `no found`;
        }
        return next()

    } catch (error) {
        if (existOrder){
            res.status(422).json({
                success: false,
                messague: `Unprocessable Entity , ${error}`,
                data: req.body
            })
        } else {
            res.status(404).json({
                success: false,
                messague: `La orden con el id ${req.params.id} no existe`,
                data: {id: req.params.id}
            })
        }
        
    }
}
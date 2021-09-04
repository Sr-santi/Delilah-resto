const express = require('express');
const auth = require('../security/auth');
const authOrder = require('../security/order_auth');
const actions = require('../database/actions');

const router = express.Router();

/**
 * @swagger
 * /orders:
 *  get:
 *      tags:
 *      - Orders
 *      summary: "Obtener las ordenes de la BD"
 *      description: "Trae todas las ordenes de la base de datos para el Admin, y las ordenes de los usuarios"
 *      parameters:
 *         - in: "header"
 *           name: "authorization"
 *           description: "Token identificador unico del usuario"
 *           required: true
 *           example: 'Bearer token'
 *           schema:
 *             type: "string"
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: "todos las ordenes del sistema"
 *              content:
 *                  application/json:   
 *                      schema:
 *                          type: "array"
 *                          items:
 *                              $ref: "#/components/schemas/Order"
 *          400:
 *              description: "acceso denegado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/Error"
 */

router.get('/orders', auth.auth, auth.authRol, async (req, res)=> {
    const Admin = req.isAdmin;
    let query;

    if(Admin){
        query = `SELECT * FROM ordenes`
    } else {
        query = `SELECT * FROM ordenes WHERE IdUser = ${req.userId}`
    }
    const result = await actions.Select(query, {});
    res.status(200).json(result);
});

/**
 * @swagger
 * /order/{id}:
 *  get:
 *      tags:
 *      - Orders
 *      summary: "Obtener orden por id"
 *      description: "Trae una orden dada un id"
 *      parameters:
 *         - in: "header"
 *           name: "authorization"
 *           description: "Token identificador unico del usuario"
 *           required: true
 *           example: 'Bearer token'
 *           schema:
 *             type: "string"
 *         - in: path
 *           name: "id"
 *           description: "Identificador unico de orden"
 *           required: true
 *           example: 1
 *           schema:
 *             type: "string"
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: "Orden buscado por id en la BD"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/Order"
 *          400:
 *              description: "acceso denegado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/Error"
 */

router.get('/order/:id', auth.auth, auth.authRol, async (req, res)=> {
    const Admin = req.isAdmin;
    if(Admin){
        const result = await actions.Select('SELECT * FROM ordenes WHERE id = :id', {id: req.params.id});
        res.status(200).json(result);
    } else {
        res.status(403).json({
            success: false,
            message: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            data: {Admin: req.isAdmin, id: req.params.id}
        });
    }
});

/**
 * @swagger
 * /order:
 *  post:
 *      tags:
 *      - Orders
 *      summary: "Agregar ordenes a la BD"
 *      description: "Ingresa ordenes al sistema, Admin crea ordenes para todos y el usuario solo puede crear ordenes personales"
 *      parameters:
 *         - in: "header"
 *           name: "authorization"
 *           description: "Token identificador unico del usuario"
 *           required: true
 *           example: 'Bearer token'
 *           schema:
 *             type: "string"
 *         - in: body
 *           description: "información de para crear la orden"
 *           schema:
 *             $ref: "#/components/schemas/Order-body"
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: "Orden creada"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           type: object
 *                           properties:
 *                              message:
 *                                  type: string
 *                                  description: "Orden creada exitosamente"
 *          400:
 *              description: "acceso denegado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/Error"
 *          500:
 *              description: "acceso denegado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/Error"
 */

router.post('/order', auth.auth, auth.authRol, authOrder.authOrder, async (req, res)=> {
    const reqComplete = req.body;

    const orderInfo = reqComplete.order;
    const detallesOrderInfo = reqComplete.detalleOrder

    const resultOrderInsert = await actions.Insert(`INSERT INTO ordenes  
    (hora, tipoPago, IdUser, estado) 
    VALUES (NOW(), :tipoPago, :IdUser, :estado)`, orderInfo);

    const idOrden = resultOrderInsert[0];
    
    for (const detalleOrderInfo of detallesOrderInfo) {
        await actions.Insert(`INSERT INTO detallesordenes  
        (idOrden, idProducto, cantidad) 
        VALUES (:idOrden, :idProducto, :cant)`, { idOrden, ...detalleOrderInfo});
    }

    // completar entrada en la base de datos
    const resultQueryName = await actions.Select(`
    SELECT SUM(p.valor * do.cantidad) as total,
    GROUP_CONCAT(do.cantidad, "x ", p.nombre, " ") as name
    FROM detallesordenes as do
    INNER JOIN producto as p ON (p.id = do.idProducto)
    WHERE do.idOrden = :idOrden`, { idOrden });
    console.log("mi total y nombre",resultQueryName)

    const resultOrderUpdate = await actions.Update(`UPDATE ordenes 
    SET nombre = :nombre, total = :total WHERE id = :idOrden`, { idOrden, nombre: resultQueryName[0].name, total: resultQueryName[0].total });

    const result = await actions.Select(`SELECT * FROM ordenes WHERE id= ${idOrden}`)

    if(resultOrderUpdate.error) {
        res.status(500).json({
            success: false,
            message: `Error de escritura en la BD o ingreso de datos invalido, ${resultOrderUpdate.message}`,
            data: req.body
        });
    } else {
        res.status(200).json({
            message: "Orden creada con exito"
        });
    }    
});

/**
 * @swagger
 * /order/{id}:
 *  put:
 *      tags:
 *      - Orders
 *      summary: "Editar ordenes en la BD"
 *      description: "Actualiza el estado de la orden con los valores validos 1,2,3,4,5,6 || 1=Nuevo, 2=Comfirmado, 3=Preparando, 4=Enviado, 5=Cancelado, 6=Entregado"
 *      parameters:
 *         - in: "header"
 *           name: "authorization"
 *           description: "Token identificador unico del usuario"
 *           required: true
 *           example: 'Bearer token'
 *           schema:
 *             type: "string"
 *         - in: path
 *           name: "id"
 *           description: "Identificador unico de orden"
 *           required: true
 *           example: 1
 *           schema:
 *             type: "string"
 *         - in: body
 *           description: "Objeto con el nuevo valor de estado"
 *           required: true
 *           schema:
 *              type: object
 *              properties:
 *                  estado:
 *                      type: number
 *                      description: 2
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: "Producto creado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           type: object
 *                           properties:
 *                              message:
 *                                  type: string
 *                                  description: "producto creado exitosamente"
 *                              parameters:
 *                                  type: object
 *                                  description: "Campos con valores actualizados validos"
 *          400:
 *              description: "acceso denegado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/Error"
 */

router.put('/order/:id', auth.auth, auth.authRol, authOrder.authOrderStatus, async (req, res)=> {
    const userStatus = req.body;
    let query;
    if (req.isAdmin) {
        query = `UPDATE ordenes SET estado =:estado WHERE id = ${req.params.id}`;
    } else {
        res.status(403).json({
            success: false,
            message: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            data: {Admin: req.isAdmin}
        });
    }
    const result = await actions.Update(query, userStatus);
    res.status(200).json({
        message: `Se actualizo la orden con exito`,
        parameters: userStatus
    });
});

/**
 * @swagger
 * /order/{id}:
 *  delete:
 *      tags:
 *      - Orders
 *      summary: "Elimina ordenes en la BD"
 *      description: "Elimina ordenes del sistema"
 *      parameters:
 *         - in: "header"
 *           name: "authorization"
 *           description: "Token identificador unico del usuario"
 *           required: true
 *           example: 'Bearer token'
 *           schema:
 *             type: "string"
 *         - in: path
 *           name: "id"
 *           description: "Identificador unico de la orden"
 *           required: true
 *           example: 1
 *           schema:
 *             type: "string"
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: "orden Eliminada"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           type: object
 *                           properties:
 *                              message:
 *                                  type: string
 *                                  description: "Orden eliminada exitosamente"
 *                              id_order:
 *                                  type: number
 *                                  description: "id de la orden eliminada"
 *          400:
 *              description: "acceso denegado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/Error"
 */

router.delete('/order/:id', auth.auth, auth.authRol, async (req, res)=> {
    let result;
    if (req.isAdmin) {
        exist = await actions.Select('SELECT * FROM ordenes WHERE id = :id', { id: req.params.id });
        if (exist.length === 0) {
            res.status(404).json({
                success: false,
                message: `El producto con el id ${req.params.id} no existe`,
                data: {id: req.params.id}
            })
        }
        result = await actions.Delete('DELETE FROM detallesordenes WHERE idOrden = :id', { id: req.params.id });
        result = await actions.Delete('DELETE FROM ordenes WHERE id = :id', { id: req.params.id });
        res.status(200).json({
            message: "la orden fue eliminada exitosamente",
            id_order: req.params.id
        });
    }else {
        res.status(403).json({
            success: false,
            message: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            data: {Admin: req.isAdmin, id: req.params.id}
        });
    }
});

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *      Order:
 *        type: object
 *        properties:  
 *          id: 
 *              type: integer
 *              description: id de la orden
 *              example: 1  
 *          nombre: 
 *              type: string
 *              description: nombre formateado de la orden
 *              example: '2x hamburguesa ,4x perro caliente'
 *          hora: 
 *              type: string
 *              description: hora de solicitud de la orden
 *              example: '04:00:00'
 *          total: 
 *              type: number
 *              description: cantidad total de la orden en moneda local
 *              example: 50000
 *          tipoPago: 
 *              type: integer
 *              description: 0 es efectivo, 1 es tarjeta de credito
 *              example: 1
 *          IdUser: 
 *              type: integer
 *              description: identificador unico de usuario
 *              example: '1'
 *          estado: 
 *              type: integer
 *              description: Estados posibles// 1,2,3,4,5,6. 1=Nuevo, 2=Comfirmado, 3=Preparando, 4=Enviado, 5=Cancelado, 6=Entregado.
 *              example: '2'
 *      Product-body:
 *        type: "object"
 *        properties:  
 *          idProducto: 
 *              type: integer
 *              description: "id del producto"
 *              example: 1  
 *          cant: 
 *              type: integer
 *              description: "cantidad de unidades de un producto"
 *              example: 3
 *      Order-body:
 *        type: object
 *        properties:  
 *          order: 
 *              type: object
 *              properties:
 *                  tipoPago:
 *                      type: integer
 *                      description: valor de 0 o 1, 0 es efectivo, 1 es tarjeta de credito
 *                      example: 0
 *                  IdUser:
 *                      type: integer
 *                      description: id unico de usuario
 *                      example: 1
 *                  estado:
 *                      type: integer
 *                      description: Estados posibles// 1,2,3,4,5,6. 1=Nuevo, 2=Comfirmado, 3=Preparando, 4=Enviado, 5=Cancelado, 6=Entregado.
 *                      example: 2
 *          detalleOrder: 
 *              type: array
 *              items:
 *                  $ref: "#/components/schemas/Product-body"
*/
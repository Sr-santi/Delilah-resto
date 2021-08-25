const express = require('express');
const auth = require('../security/auth');
const actions = require('../database/actions');

const router = express.Router();

router.get('/orders', auth.auth, auth.authRol, async (req, res)=> {
    //usuario solo ve sus ordenes
    //admin todas las ordenes
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

router.get('/order/:id', auth.auth, auth.authRol, async (req, res)=> {
    //admin todas las ordenes
    if(Admin){
        const result = await actions.Select('SELECT * FROM ordenes WHERE id = :id', {id: req.params.id});
        res.status(200).json(result);
    } else {
        res.status(403).json({
            success: false,
            messague: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            data: {Admin: req.isAdmin, id: req.params.id}
        });
    }
});

router.post('/order', auth.auth, async (req, res)=> {
    // cambiar en un middleware
    // usuario = del usuario
    // Admin IdUser = cualquiera
    const reqComplete = req.body;

    //middleware
    const orderInfo = reqComplete.order; //comprobar
    const detallesOrderInfo = reqComplete.detalleOrder //comprobar

    const resultOrderInsert = await actions.Insert(`INSERT INTO ordenes  
    (hora, tipoPago, IdUser, estado) 
    VALUES (NOW(), :tipoPago, :IdUser, :estado)`, orderInfo);

    const idOrden = resultOrderInsert[0];
    
    for (const detalleOrderInfo of detallesOrderInfo) {
        await actions.Insert(`INSERT INTO detallesordenes  
        (idOrden, idProducto, cant) 
        VALUES (:idOrden, :idProducto, :cant)`, { idOrden, ...detalleOrderInfo});
    }

    // completar entrada en la base de datos
    const resultQueryName = await actions.Select(`
    SELECT SUM(p.valor * do.cant) as total,
    GROUP_CONCAT(do.cant, "x ", p.nombre, " ") as name
    FROM detallesordenes do
    INNER JOIN producto p ON (p.id = do.idProducto)
    WHERE do.idOrden = :idOrden`, { idOrden });

    const resultOrderUpdate = await actions.Update(`UPDATE ordenes 
    SET nombre = :nombre, total = :total WHERE id = :idOrden`, { idOrden, nombre: resultQueryName[0].name, total: resultQueryName[0].total });

    if(resultOrderUpdate.error) {
        res.status(500).json({
            success: false,
            messague: `Error de escritura en la BD o ingreso de datos invalido, ${result.message}`,
            data: req.body
        });
    } else {
        res.status(200).json(resultOrderUpdate);
    }    
});

router.put('/order/:id', (req, res)=> {
    //Code here
    //solo cambiar el estado
});

router.delete('/order/:id', (req, res)=> {
    //Code here
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
 *              example: '2x hamburguesa 4x perro caliente'
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
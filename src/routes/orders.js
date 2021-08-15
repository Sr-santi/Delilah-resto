const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const auth = require('../security/auth');
=======
const actions = require('../database/actions');
>>>>>>> c0fdeddb5fa12e4816c3496478c9d55783604954

router.get('/orders', auth.auth, async (req, res)=> { //hacer el middleware para autenticar rol
    //usuario solo ve sus ordenes
    //admin todas las ordenes
    const result = await actions.Select('SELECT * FROM ordenes', {});
    res.json(result);
});

router.get('/order/:id', auth.auth, async (req, res)=> { //hacer el middleware para autenticar rol
    //usuario solo ve sus ordenes
    //admin todas las ordenes
    const result = await actions.Select('SELECT * FROM ordenes WHERE id = :id', {id: req.params.id});
    res.json(result);
});

router.post('/order', async (req, res)=> {
    const reqComplete = req.body

    const orderInfo = reqComplete.order;
    const detallesOrderInfo = reqComplete.detalleOrder

    const resultOrderInsert = await actions.Insert(`INSERT INTO ordenes  
    (hora, tipoPago, IdUser, estado) 
    VALUES (NOW(), :tipoPago, :IdUser, :estado)`, orderInfo);

    const idOrden = resultOrderInsert[0];
    
    for (const detalleOrderInfo of detallesOrderInfo) {
        await actions.Insert(`INSERT INTO detallesordenes  
        (idOrden, idProducto, cant) 
        VALUES (:idOrden, :idProducto, :cant)`, { idOrden, ...detalleOrderInfo});
    }

    const resultQueryName = await actions.Select(`
    SELECT SUM(p.valor * do.cant) as total,
    GROUP_CONCAT(do.cant, "x ", p.nombre, " ") as name
    FROM detallesordenes do
    INNER JOIN producto p ON (p.id = do.idProducto)
    WHERE do.idOrden = :idOrden`, { idOrden });

    const resultOrderUpdate = await actions.Update(`UPDATE ordenes 
    SET nombre = :nombre, total = :total WHERE id = :idOrden`, { idOrden, nombre: resultQueryName[0].name, total: resultQueryName[0].total });

    if(resultOrderUpdate.error) {
        res.status(500).json(result.message);
    } else {
        res.json(resultOrderUpdate);
    }    
});

router.put('/order/:id', (req, res)=> {
    //Code here
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
 *              description: id del usuario
 *              example: 1  
 *          nombreUsuaurio: 
 *              type: string
 *              description: nombre del usuario
 *              example: 'Wvanegas'
 *          nombreCompleto: 
 *              type: string
 *              description: nombre completo del usuario
 *              example: 'Walter vanegas'
 *          email: 
 *              type: string
 *              description: email del usuario
 *              example: 'Waltervanegas@gmail.com'
 *          telefono: 
 *              type: string
 *              description: telefono del usuario
 *              example: '3007002250'
 *          direccion: 
 *              type: string
 *              description: direccion del usuario
 *              example: 'N/A'
 *          contrasena: 
 *              type: string
 *              description: contraseña del usuario
 *              example: '1234'
 *          idRole: 
 *              type: integer
 *              description: rol del usuario
 *              example: '2'
 * 
*/
const express = require('express');
const auth = require('../security/auth');
const authProduct = require('../security/product_auth');
const actions = require('../database/actions');

const router = express.Router();

/**
 * @swagger
 * /products:
 *  get:
 *      tags:
 *      - Products
 *      summary: "Obtener los productos de la BD"
 *      description: "Trae todos los productos de la base de datos"
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
 *              description: "todos los productos del sistema"
 *              content:
 *                  application/json:   
 *                      schema:
 *                          type: "array"
 *                          items:
 *                              $ref: "#/components/schemas/Product"
 *          400:
 *              description: "acceso denegado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/Error"
 */
router.get('/products', auth.auth, async (req, res)=> {
    let result = await actions.Select('SELECT * FROM producto', {});
    res.status(200).json(result)
});

/**
 * @swagger
 * /product/{id}:
 *  get:
 *      tags:
 *      - Products
 *      summary: "Obtener producto por id"
 *      description: "Trae un producto dado un id"
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
 *           description: "Identificador unico de producto"
 *           required: true
 *           example: 1
 *           schema:
 *             type: "string"
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: "producto buscado por id en la BD"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/Product"
 *          400:
 *              description: "acceso denegado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/Error"
 */

router.get('/product/:id', auth.auth, async (req, res)=> {
    let result

    result = await actions.Select('SELECT * FROM producto WHERE id = :id', { id: req.params.id });
    res.status(200).json(result);
}); 

/**
 * @swagger
 * /product:
 *  post:
 *      tags:
 *      - Products
 *      summary: "Agregar productos a la BD"
 *      description: "Ingresa productos al sistema, solo permiso para el Admin"
 *      parameters:
 *         - in: "header"
 *           name: "authorization"
 *           description: "Token identificador unico del usuario"
 *           required: true
 *           example: 'Bearer token'
 *           schema:
 *             type: "string"
 *         - in: body
 *           description: "información del producto"
 *           schema:
 *             $ref: "#/components/schemas/Product"
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

router.post('/product', auth.auth, auth.authRol, authProduct.authProduct, async (req, res)=> {
    //autenticar campos de producto
    /* Solo ingresa productos el Admin */
    const product = req.body;
    const Admin = req.isAdmin;
    let result;

    if (Admin){
        result = await actions.Insert(`INSERT INTO producto (nombre, valor, foto) 
        VALUES (:nombre, :valor, :foto)`, product);
    }else {
        res.status(403).json({
            success: false,
            message: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            data: {Admin: req.isAdmin}
        })
    }
    if(result.error) {
        res.status(500).json({
            success: false,
            message: "Error de escritura en la BD o ingreso de datos invalido",
            data: req.body
        });
    } else {
        res.status(200).json({
            message: "Producto creado con exito"
        });
    }    
});

/**
 * @swagger
 * /product/{id}:
 *  patch:
 *      tags:
 *      - Products
 *      summary: "Editar productos en la BD"
 *      description: "Actualiza productos del sistema"
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
 *           description: "Identificador unico de producto"
 *           required: true
 *           example: 1
 *           schema:
 *             type: "string"
 *         - in: body
 *           description: "Objeto con campos a modificar del producto, se debe de enviar por lo menos uno para ser valida la petición"
 *           required: true
 *           schema:
 *             $ref: "#/components/schemas/Product"
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

router.patch('/product/:id', auth.auth, auth.authRol, authProduct.authProductObject, async (req, res)=> { 
    //comprobar que los campos esten o arrojar errores, poner por defecto los valores de usuario
    //refactor solo poner en el query las propiedades que estan en el objeto
    // poner los status

    const product = req.body;
    let query_options = req.queries;
    let query;
    if (req.isAdmin) {
        query = `UPDATE producto SET ${query_options} WHERE id = ${req.params.id}`;
    } else {
        res.status(403).json({
            success: false,
            message: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            data: {Admin: req.isAdmin}
        });
    }
    const result = await actions.Update(query, product);
    res.status(200).json({
        message: `Se actualizo el producto con exito`,
        parameters: product
    });
});

/**
 * @swagger
 * /product/{id}:
 *  delete:
 *      tags:
 *      - Products
 *      summary: "Elimina productos en la BD"
 *      description: "Elimina productos del sistema"
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
 *           description: "Identificador unico del producto"
 *           required: true
 *           example: 1
 *           schema:
 *             type: "string"
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: "producto Eliminado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           type: object
 *                           properties:
 *                              message:
 *                                  type: string
 *                                  description: "producto eliminado exitosamente"
 *                              id_product:
 *                                  type: number
 *                                  description: "id de producto eliminado"
 *          400:
 *              description: "acceso denegado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/Error"
 */

router.delete('/product/:id', auth.auth, auth.authRol, async (req, res)=> {
    let result;
    if (req.isAdmin) {
        exist = await actions.Select('SELECT * FROM producto WHERE id = :id', { id: req.params.id });
        if (exist.length === 0) {
            res.status(404).json({
                success: false,
                messague: `El producto con el id ${req.params.id} no existe`,
                data: {id: req.params.id}
            })
        }
        result = await actions.Delete('DELETE FROM detallesordenes WHERE idProducto = :id', { id: req.params.id });
        result = await actions.Delete('DELETE FROM producto WHERE id = :id', { id: req.params.id });
        res.status(200).json({
            message: "El producto fue eliminado exitosamente",
            id_product: req.params.id
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
 *      Product:
 *        type: "object"
 *        properties:  
 *          id: 
 *              type: "integer"
 *              description: "id del producto"
 *              example: 1  
 *          nombre: 
 *              type: "string"
 *              description: "nombre del producto"
 *              example: 'Hamburguesa'
 *          valor: 
 *              type: number
 *              description: "Precio del producto en moneda local"
 *              example: 14000
 *          foto: 
 *              type: string
 *              description: "URL de la foto del producto"
 *              example: 'https://bit.ly/3D8TjDD'
 * 
*/
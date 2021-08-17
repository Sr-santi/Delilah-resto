const express = require('express');
const auth = require('../security/auth');
const actions = require('../database/actions');

const router = express.Router();

/**
 * @swagger
 * /users:
 *  get:
 *      tags:
 *      - Users
 *      summary: "Obtener los usuarios de la BD"
 *      description: "Trae todos los usuarios de la base de datos para el Admin y trae la información de el usuario cuando la petición la realiza un usuario sin permisos de admin"
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
 *              description: "todos los usurios del sistema"
 *              content:
 *                  application/json:   
 *                      schema:
 *                          type: "array"
 *                          items:
 *                              $ref: "#/components/schemas/User"
 */
router.get('/users', auth.auth, auth.authRol, async (req, res)=> {
    let result
    if (req.isAdmin) {
        result = await actions.Select('SELECT * FROM usuarios', {});
    } else {
        result = await actions.Select('SELECT * FROM usuarios WHERE nombreUsuaurio = :userName', { userName: req.user.userName });
    }
    res.json(result)
    
});

/**
 * @swagger
 * /user/{id}:
 *  get:
 *      tags:
 *      - Users
 *      summary: "Obtener usuario por id"
 *      description: "Trae un usuario dado un id, para el admin no hay restricciones, para el usuario no es posible usar este endpoint"
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
 *           description: "Identificador unico del usuario"
 *           required: true
 *           example: 1
 *           schema:
 *             type: "string"
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: "usuario buscado por id en la BD"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/User"
 *          400:
 *              description: "acceso denegado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/Error"
 */

router.get('/user/:id', auth.auth, auth.authRol, async (req, res)=> {
    let result
    if (req.isAdmin) {
        result = await actions.Select('SELECT * FROM usuarios WHERE id = :id', { id: req.params.id });
        res.json(result);
    }else {
        res.status(400).json({
            messague: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            codeError: 01,
        });
    }
}); 

/**
 * @swagger
 * /user:
 *  post:
 *      tags:
 *      - Users
 *      description: "Ingresa usuarios del sistema"
 *      parameters:
 *         - in: body
 *           description: "información del usuario del usuario"
 *           schema:
 *             $ref: "#/components/schemas/User"
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: "Usuario creado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           type: object
 *                           properties:
 *                              messague:
 *                                  type: string
 *                                  description: "usuario creado exitosamente"
 *          500:
 *              description: "acceso denegado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/Error"
 */

router.post('/user', auth.authUser, async (req, res)=> {
    //autenticar campos de usuarios
    /* Solo se pueden crear usuarios clientes */
    const user = req.body;
    user.idRole = 2;
    let result;
    user.nombreUsuaurio = user.nombreUsuaurio.toLowerCase();
    result = await actions.Insert(`INSERT INTO usuarios (nombreUsuaurio, nombreCompleto, email, telefono, direccion, contrasena, idRole) 
    VALUES (:nombreUsuaurio, :nombreCompleto, :email, :telefono, :direccion, :contrasena, :idRole)`, user);
    if(result.error) {
        res.status(500).json({
            messague: "Error de escritura en la BD o ingreso de datos invalido",
            codeError: 05,
        });
    } else {
        res.status(200).json({
            messague: "Usuario creado con exito"
        });
    }    
});

/**
 * @swagger
 * /user/:id:
 *  patch:
 *      tags:
 *      - Users
 *      description: "Actualiza usuarios del sistema"
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
 *           description: "Identificador unico del usuario"
 *           required: true
 *           example: 1
 *           schema:
 *             type: "string"
 *         - in: body
 *           description: "Objeto con campos a modificar del usuario, se debe de enviar por lo menos uno para ser valida la petición"
 *           required: true
 *           schema:
 *             $ref: "#/components/schemas/User"
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: "Usuario actualizado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/User"
 */

router.patch('/user/:id', auth.auth, auth.authRol, auth.authUserObject, async (req, res)=> { 
    //comprobar que los campos esten o arrojar errores, poner por defecto los valores de usuario
    //refactor solo poner en el query las propiedades que estan en el objeto
    // poner los status

    console.log('ey')
    const user = req.body;
    let query_options = req.queries;
    let query;
    if (req.isAdmin) {
        query = `UPDATE usuarios SET ${query_options} WHERE id = ${req.params.id}`;
    } else {
        if (req.userId !== req.params.id) {
            res.status(400).json({
                messague: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
                codeError: 01,
            })
        }
        query = `UPDATE usuarios SET ${query_options} WHERE id = ${req.params.id}`;
    }
    const result = await actions.Update(query, user);
    res.status(200).json(result);
});

/**
 * @swagger
 * /user/:id:
 *  delete:
 *      tags:
 *      - Users
 *      description: "Elimina usuarios del sistema"
 *      parameters:
 *         - in: "header"
 *           name: "authorization"
 *           description: "Identificador unico del usuario"
 *           schema:
 *             type: "string"
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: "Usuario Eliminado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/User"
 *          400:
 *              description: "Usuario Eliminado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/User"
 */

router.delete('/user/:id', auth.auth, auth.authRol, async (req, res)=> {
    let result
    if (req.isAdmin) {
        result = await actions.Delete('DELETE FROM usuarios WHERE id = :id', { id: req.params.id });
        res.status(200).json({
            description: "El usuario fue eliminado exitosamente",
            content: result
        });
    }else {
        res.status(400).json({
            error: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            codeError: 01,
        });
    }
});

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *      User:
 *        type: "object"
 *        properties:  
 *          id: 
 *              type: "integer"
 *              description: "id del usuario"
 *              example: 1  
 *          nombreUsuaurio: 
 *              type: "string"
 *              description: "nombre del usuario"
 *              example: 'Sr_rios'
 *          nombreCompleto: 
 *              type: "string"
 *              description: "nombre completo del usuario"
 *              example: 'Santiago Ríos'
 *          email: 
 *              type: string
 *              description: email del usuario
 *              example: 'santi@gmail.com'
 *          telefono: 
 *              type: string
 *              description: telefono del usuario
 *              example: '+573216328822'
 *          direccion: 
 *              type: string
 *              description: direccion del usuario
 *              example: 'Cra 40 #22 13'
 *          contrasena: 
 *              type: string
 *              description: contraseña del usuario
 *              example: 'unaClave'
 *          idRole: 
 *              type: integer
 *              description: rol del usuario, 1 es admin y 2 es usuario comun.
 *              example: '2'
 *      Error:
 *         type: object
 *         properties:
 *           messague:
 *              type: string
 *              description: "mensaje de error"
 *           codeError:
 *              type: integer
 *              description: "codigo de error"
 * 
*/

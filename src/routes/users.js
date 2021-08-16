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
 *      description: Trae todos los usuarios del sistema
 *      parameters:
 *         - in: header
 *           name: authorization
 *           description: Identificador unico del usuario
 *           schema:
 *             type: string
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: todos los usurios del sistema
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
 *      description: Trae todos los usuarios del sistema
 *      parameters:
 *         - in: header
 *           name: token
 *           description: Identificador unico del usuario
 *           schema:
 *             type: string
 *         - in: path
 *           name: id
 *           description: Identificador unico del usuario
 *           schema:
 *             type: string
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: todos los usurios del sistema
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/User"
 */

router.get('/user/:id', auth.auth, auth.authRol, async (req, res)=> {
    let result
    if (req.isAdmin) {
        result = await actions.Select('SELECT * FROM usuarios WHERE id = :id', { id: req.params.id });
        res.json(result);
    }else {
        res.status(400).json({
            error: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
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
 *      description: Ingresa usuarios del sistema
 *      parameters:
 *         - in: header
 *           name: token
 *           description: Identificador unico del usuario
 *           schema:
 *             type: string
 *         - in: body
 *           description: informaicon del usuario del usuario
 *           schema:
 *             $ref: "#/components/schemas/User"
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: Usuario creado
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/User"
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
        res.status(500).json(result.message);
    } else {
        res.json(result);
    }    
});


/**
 * @swagger
 * /user/:id:
 *  put:
 *      tags:
 *      - Users
 *      description: Actualiza usuarios del sistema
 *      parameters:
 *         - in: header
 *           name: token
 *           description: Identificador unico del usuario
 *           schema:
 *             type: string
 *         - in: body
 *           description: informaicion del usuario del usuario
 *           schema:
 *             $ref: "#/components/schemas/User"
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: Usuario actualizado
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/User"
 */

router.put('/user/:id', auth.auth, auth.authRol, async (req, res)=> { // leer
    //Code here
});

/**
 * @swagger
 * /user/:id:
 *  patch:
 *      tags:
 *      - Users
 *      description: Actualiza usuarios del sistema
 *      parameters:
 *         - in: header
 *           name: token
 *           description: Identificador unico del usuario
 *           schema:
 *             type: string
 *         - in: body
 *           description: informaicion del usuario del usuario
 *           schema:
 *             $ref: "#/components/schemas/User"
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: Usuario actualizado
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/User"
 */

router.patch('/user/:id', auth.auth, auth.authRol, auth.authUserObject, async (req, res)=> { 
    //comprobar que los campos esten o arrojar errores, poner por defecto los valores de usuario
    //refactor solo poner en el query las propiedades que estan en el objeto
    // poner los status

    const user = req.body;
    let query_options = req.query.join(',');
    let query;
    if (req.isAdmin) {
        query = `UPDATE usuarios SET ${query_options} WHERE id = ${req.params.id}`;
    } else {
        if (req.userId !== req.params.id) {
            res.status(400).json({
                error: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
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
 *      description: Elimina usuarios del sistema
 *      parameters:
 *         - in: header
 *           name: token
 *           description: Identificador unico del usuario
 *           schema:
 *             type: string
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: Usuario Eliminado
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/User"
 */

router.delete('/user/:id', auth.auth, auth.authRol, async (req, res)=> {
    let result
    if (req.isAdmin) {
        result = await actions.Delete('DELETE FROM usuarios WHERE id = :id', { id: req.params.id });
        res.json(result);
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

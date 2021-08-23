const express = require('express');
const auth = require('../security/auth');
const actions = require('../database/actions');

const router = express.Router();


/**
 * @swagger
 * /login:
 *  post:
 *      tags:
 *      - Login
 *      summary: "Generar Token de acceso"
 *      description: "Genera el Token de acceso"
 *      parameters:
 *         - in: body
 *           description: "Credenciales de usuario, nombre de usuario y contraseña"
 *           required: true
 *           schema:
 *             $ref: "#/components/schemas/UserCredentials"
 *      produces:
 *         - application/json
 *      responses:
 *          200:
 *              description: "Usuario creado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           type: string
 *                           description: "Token unico de usuario"
 *                           example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6InVzZXIxIi'
 *          400:
 *              description: "acceso denegado"
 *              content:
 *                  application/json:   
 *                      schema:
 *                           $ref: "#/components/schemas/Error"
 */

router.post('/login', async (req, res)=> {
    const params = req.body;
    // hacer comprobacion de password
    const user = {
        userName: params.userName,
        password: params.password
    };    
    const result = await actions.Select(`SELECT COUNT(*) as count 
    FROM usuarios
    WHERE nombreUsuaurio = :userName AND contrasena = :password`, user);

    if(result && Array.isArray(result) && result.length > 0) {
        if(result[0].count == 1) {
            res.status(200).json(auth.generateToken({userName: user.userName}));
        }else {
            res.status(404).json({
                success: false,
                messague: 'Usuario no encontrado, nombre de usuario o contraseña invalida',
                data: user
            });
        }
    }else{
        res.status(404).json({
            success: false,
            messague: 'Usuario no encontrado, nombre de usuario o contraseña invalida',
            data: user
        });
    }   
});

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *      UserCredentials:
 *        type: "object"
 *        properties:  
 *          userName: 
 *              type: "string"
 *              description: "nombre del usuario"
 *              example: 'Sr_rios'
 *          password: 
 *              type: string
 *              description: contraseña del usuario
 *              example: 'unaClave'
*/
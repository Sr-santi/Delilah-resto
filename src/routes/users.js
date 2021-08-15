const express = require('express');
const auth = require('../security/auth');
const actions = require('../database/actions');

const router = express.Router();

router.get('/users', auth.auth, auth.authRol, async (req, res)=> {
    let result
    if (req.isAdmin) {
        result = await actions.Select('SELECT * FROM usuarios', {});
    } else {
        result = await actions.Select('SELECT * FROM usuarios WHERE nombreUsuaurio = :userName', { userName: req.user.userName });
    }
    res.json(result)
    
});

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

router.post('/user', auth.authUser, async (req, res)=> {//autenticar campos de usuarios
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

router.put('/user/:id', auth.auth, auth.authRol, async (req, res)=> { // leer
    //Code here
});

router.patch('/user/:id', auth.auth, auth.authRol, async (req, res)=> { //comprobar que los campos esten o arrojar errores, poner por defecto los valores de usuario
    //refactor solo poner en el query las propiedades que estan en el objeto
    const user = req.body;
    let query
    if (req.isAdmin) {
        query = `UPDATE usuarios SET nombreCompleto = :nombreCompleto, email = :email, telefono = :telefono, direccion = :direccion, contrasena = :contrasena, idRole = :idRole
        WHERE id = ${req.params.id}`
    } else {
        if (req.userId !== req.params.id) {
            res.json({
                error: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
                codeError: 01,
            })
        }
        query = `UPDATE usuarios SET nombreCompleto = :nombreCompleto, email = :email, telefono = :telefono, direccion = :direccion, contrasena = :contrasena WHERE id = ${req.params.id}`
    }
    const result = await actions.Update(query, user);
    res.json(result);
});

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

// se de poner
/**
 * @swagger
 * components:
 *  schemas:
 *  User:
 *  type: object
 *  properties:
 *      id: 
 *          type: string
 *          description: id del usuario
 *          example: 1
 * 
 *      nombreUsuario: 
 *          type: string
 *          description: nombre del usuario
 *          example: 'Wvanegas'
 *      nombreCompleto:
 *          type: string
 *          description: nombre completo
 */
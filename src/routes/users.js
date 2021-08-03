const express = require('express');
const auth = require('../security/auth');
const actions = require('../database/actions');

const router = express.Router();

router.get('/users', auth.auth, auth.authRol, async (req, res)=> { //hacer el middleware para autenticar rol ; usamos jwt para obtener el json descrifrado
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

router.post('/user', auth.authUser, async (req, res)=> {
    /* Solo se pueden crear usuarios clientes */
    //permitir al Admin crear Admins
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

router.patch('/user/:id', auth.auth, auth.authRol, auth.authUser, async (req, res)=> { //comprobar que los campos esten o arrojar errores , error para usuario no encontrado
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

router.delete('/user/:id', auth.auth, auth.authRol, async (req, res)=> { // error para usuario no encontrado
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
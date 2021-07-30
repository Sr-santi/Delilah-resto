const express = require('express');
const auth = require('../security/auth');
const actions = require('../database/actions');

const router = express.Router();

router.get('/users', auth.auth, async (req, res)=> {
    const result = await actions.Select('SELECT * FROM usuarios', {});
    res.json(result);
});

router.get('/user/:id', auth.auth, async (req, res)=> {
    const result = await actions.Select('SELECT * FROM usuarios WHERE id = :id', { id: req.params.id });
    res.json(result);
});

router.post('/user', async (req, res)=> {
    const user = req.body;
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

router.put('/user/:id', auth.auth, async (req, res)=> {
    //Code here
});

router.patch('/user/:id', auth.auth, async (req, res)=> {
    const user = req.body;
    const result = await actions.Update(`UPDATE usuarios SET email = :email WHERE id = :id`, user);
    res.json(result);
});

router.delete('/user/:id', auth.auth, async (req, res)=> {
    //Code here
});

module.exports = router;
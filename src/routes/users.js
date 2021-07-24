const express = require('express');
const auth = require('../security/auth');
const actions = require('../database/actions');

const router = express.Router();

router.get('/users', async (req, res)=> {
    const result = await actions.Select('SELECT * FROM usuarios', {});
    res.json(result);
});

router.get('/user/:id', async (req, res)=> {
    const result = await actions.Select('SELECT * FROM usuarios WHERE id = :id', { id: req.params.id });
    res.json(result);
});

router.post('/user', async (req, res)=> {
    const user = req.body;
    const result = await actions.Insert(`INSERT INTO usuarios (nombre, apellido, direccion, telefono, email) 
    VALUES (:nombre, :apellido, :direccion, :telefono, :email)`, user);
    res.json(result);
});

router.put('/user/:id', async (req, res)=> {
    //Code here
});

router.patch('/user/:id', async (req, res)=> {
    const user = req.body;
    const result = await actions.Update(`UPDATE usuarios SET email = :email WHERE id = :id`, user);
    res.json(result);
});

router.delete('/user/:id', async (req, res)=> {
    //Code here
});

module.exports = router;
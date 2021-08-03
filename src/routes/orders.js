const express = require('express');
const router = express.Router();
const auth = require('../security/auth');

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

router.post('/order', (req, res)=> {
    //Code here
});

router.put('/order/:id', (req, res)=> {
    //Code here
});

router.delete('/order/:id', (req, res)=> {
    //Code here
});

module.exports = router;
const express = require('express');
const auth = require('../security/auth');

const router = express.Router();

router.post('/login', (req, res)=> {
    const params = req.body;
    const user = {
        userName: params.userName,
        password: params.password
    };
    // aqui va logica de base de datos
    res.json(auth.generateToken({userName: user.userName}));
});

module.exports = router;
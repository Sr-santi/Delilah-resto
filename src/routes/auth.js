const express = require('express');
const auth = require('../security/auth');
const actions = require('../database/actions');

const router = express.Router();

router.post('/login', async (req, res)=> {
    const params = req.body;
    const user = {
        userName: params.userName,
        password: params.password
    };    
    const result = await actions.Select(`SELECT COUNT(*) as count 
    FROM usuarios
    WHERE nombreUsuaurio = :userName AND contrasena = :password`, user);

    if(result && Array.isArray(result) && result.length > 0) {
        if(result[0].count == 1) {
            res.json(auth.generateToken({userName: user.userName}));
        }else {
            res.status(404).json('Usuario no encontrado');
        }
    }else{
        res.status(404).json('Usuario no encontrado');
    }   
});

module.exports = router;
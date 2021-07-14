const express = require('express');
const auth = require('../security/auth');

const router = express.Router();

router.get('/users', auth.auth, (req, res)=> {
    //Code here
    res.send('no hay usuarios');
});

router.get('/user/:id', (req, res)=> {
    //Code here
});

router.post('/user', (req, res)=> {
    //Code here
});

router.put('/user/:id', (req, res)=> {
    //Code here
});

router.delete('/user/:id', (req, res)=> {
    //Code here
});

module.exports = router;
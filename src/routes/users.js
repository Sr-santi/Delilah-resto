const express = require('express');
const router = express.Router();

router.get('/users', (req, res)=> {
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
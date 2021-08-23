const jwt = require('jsonwebtoken');
const actions = require('../database/actions');

const firma = 'Firma_para_proyecto'; //manejo seguro ; preguntar sobre practica seguro

module.exports.generateToken = (data) => {
    return jwt.sign(data, firma);
}

module.exports.auth = (req, res, next) => {
    try {
       const token = req.headers.authorization.split(' ')[1];
       const tokenVerificado = jwt.verify(token, firma);
       if(tokenVerificado) {
        req.user = tokenVerificado;
        return next();
       }
    } catch (error) {
        res.status(403).json({
            success: false,
            messague: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            data: {token: 'No valido'}
        });
    }
};

module.exports.authRol = async (req,res,next) => {
    try {
        const userName = req.user.userName;
        const result = await actions.Select('SELECT * FROM usuarios WHERE nombreUsuaurio = :userName', { userName: userName });
        const isAdmin = result[0].idRole === 1 ? true:false;
        req.isAdmin = isAdmin;
        req.userId = result[0].id;
        return next();

    } catch (error) {
        res.status(422).json({
            success: false,
            messague: 'El usuario no tiene un rol definido',
            data: {token: 'No valido'}
        })
    }
};
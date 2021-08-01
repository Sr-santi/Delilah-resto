const jwt = require('jsonwebtoken');

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
        res.json({
            error: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            codeError: 01
        })
    }
};
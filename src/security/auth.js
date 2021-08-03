const jwt = require('jsonwebtoken');
const actions = require('../database/actions');

const firma = 'Firma_para_proyecto'; //manejo seguro ; preguntar sobre practica seguro

function validateEmail(email){
    let result = false;
    if(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(email)){
        result = true
    }
    return result
}
function validateNumber(number){
    let result = false;
    if(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/i.test(number)){
        result = true;
    }
    return result;
}

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
            codeError: 01,
        });
    }
};

module.exports.authRol = async (req,res,next) => {
    try {
        const userName = req.user.userName;
        const result = await actions.Select('SELECT * FROM usuarios WHERE nombreUsuaurio = :userName', { userName: userName });
        const isAdmin = result[0].idRole === 1 ? true:false;
        req.isAdmin = isAdmin
        req.userId = result[0].id
        return next();

    } catch (error) {
        res.json({
            error: 'El usuario no tiene un rol definido',
            codeError: 02
        })
    }
};

module.exports.authUser = (req,res,next) => {
    try {
        const user = req.body;
        const email =validateEmail(user.email);
        const number = validateNumber(user.telefono);
        if (!number){throw "usuario.telefono no es valido";}
        else if (!email){throw "usuario.email no es una dirección de correo valida";}
        return next();

    } catch (error) {
        res.json({
            error: `campo no valido, ${error}`,
            codeError: 03
        });
    }
}
const jwt = require('jsonwebtoken');
const actions = require('../database/actions');

const UserQueryOptions = {
    nombreCompleto: "nombreCompleto = :nombreCompleto",
    email: "email = :email",
    telefono: "telefono = :telefono",
    direccion: "direccion = :direccion",
    contrasena: "contrasena = :contrasena",
    idRole: "idRole = :idRole"
}

function validateEmail(email){
    let result = false;
    if(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(email)){
        result = true;
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

function validateUserObject(userObject){
    let listProperties = Object.keys(UserQueryOptions)
    listProperties.push('nombreUsuaurio')
    let listUserProperties = Object.keys(userObject)
    let equalStruct = listProperties.every(property => listUserProperties.includes(property)) && listUserProperties.every(property => listProperties.includes(property))
    return equalStruct
}

module.exports.authUser = (req,res,next) => {
    try {
        const user = req.body;
        if (!validateUserObject(user)){throw `No ingreso todos los campos validos, propiedades requeridas nombreUsuaurio,${Object.keys(UserQueryOptions)}`}
        const email =validateEmail(user.email);
        const number = validateNumber(user.telefono);
        if (!number){throw "usuario.telefono no es valido";}
        else if (!email){throw "usuario.email no es una dirección de correo valida";}
        return next();

    } catch (error) {
        res.status(422).json({
            error: `campo no valido, ${error}`,
            codeError: 422
        });
    }
}

module.exports.authUserObject = (req,res,next) => {
    try {
        const user = req.body;
        let valid_user_params = {};
        const Admin = req.isAdmin;
        // campos especiales
        if ('email' in user){
            if (!validateEmail(user.email)){throw "usuario.email no es una dirección de correo valida";}
        }
        if ('telefono' in user){
            if (!validateNumber(user.telefono)){throw "usuario.telefono no es valido";}
        }
        if (!Admin){
            delete user['idRole'];
        }

        const user_keys = Object.keys(user);
        let queries= [];
        if (user_keys.length>0){
            user_keys.forEach(property => {
                if (property in UserQueryOptions){
                    queries.push(UserQueryOptions[property]);
                    valid_user_params[property] = user[property];
                }
            })
            if(queries.length === 0){throw "No hay parametros validos en la solicitud";}
            req.body = valid_user_params;
            req.queries = queries.join(', ');
            return next();
        }else {
            throw "No hay parametros validos en la solicitud";
        }
    } catch (error) {
        res.status(422).json({
            error: `Unprocessable Entity , ${error}`,
            codeError: 422,
        })
    }
}
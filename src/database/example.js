const Sequelize = require('sequelize');
const database = new Sequelize('mysql://root:password@localhost:3306/deliahresto');

const usuario = {
    nombre: 'Andres',
    apellido: 'Herandez',
    direccion: 'Fake street 123',
    telefono: '300224545',
    email: 'mail@dominio.com'
}

database.query(`INSERT INTO usuarios (Nombre, Apellido, Direccion, Telefono, Email) 
VALUES (:nombre, :apellido, :direccion, :telefono, :email)`, 
{ 
    replacements: usuario,
    type: database.QueryTypes.INSERT 
}).then((resultados) => {
    console.log(resultados);
}).catch((error) => {
    console.error(error);
});

database.query('SELECT * FROM usuarios', { type: database.QueryTypes.SELECT }).then((resultados) => {
    console.log(resultados);
}).catch((error) => {
    console.error(error);
});

database.query('SELECT * FROM usuarios WHERE Nombre = ? AND Apellido = ?', { 
    replacements: ['Walter', 'Vanegas'],
    type: database.QueryTypes.SELECT 
}).then((resultados) => {
    console.log(resultados);
}).catch((error) => {
    console.error(error);
});

database.query('SELECT * FROM usuarios WHERE Nombre = :nombre AND Apellido = :apellido', { 
    replacements: { apellido:'Gamarra', nombre: 'Emiliano' } ,
    type: database.QueryTypes.SELECT 
}).then((resultados) => {
    console.log(resultados);
}).catch((error) => {
    console.error(error);
});
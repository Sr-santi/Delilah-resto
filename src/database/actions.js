const { Sequelize } = require('sequelize');
const database = new Sequelize('mysql://root:unaclave@35.196.27.7/delilahresto');

//prueba
/* async function dbConnection() {
    try {
        await database.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}
dbConnection() */

module.exports.Select = async (query, data) => {
   return await database.query(query, { 
        replacements: data ,
        type: database.QueryTypes.SELECT 
    });
}

module.exports.Insert = async (query, data) => {
    let result;
    try {
        result = await database.query(query, { 
            replacements: data ,
            type: database.QueryTypes.INSERT 
        });
    } catch (error) {
        result = {
            error: true,
            message: error
        }
    }
   return result;
}

module.exports.Update = async (query, data) => {
    return await database.query(query, { 
        replacements: data ,
        type: database.QueryTypes.UPDATE 
    });
}

module.exports.Delete = async (query, data) => {
    return await database.query(query, { 
        replacements: data ,
        type: database.QueryTypes.DELETE 
    });
}
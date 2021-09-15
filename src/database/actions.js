const { Sequelize } = require('sequelize');
const database = new Sequelize('mysql://user:password@dominio:puerto/DB_name');

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
const express = require('express');
const helmet = require('helmet');
const bodyparser = require('body-parser');

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = requiere('swagger-ui-express');

const userRouter = require('./routes/users');
const orderRouter = require('./routes/orders');
const authRouter = require('./routes/auth');

const server = express();
server.use(bodyparser.json());
server.use(helmet());

const port = 3000;
const swaggerDefinitions = require('./swaggerDefinition');
const options = {
    ...swaggerDefinitions,
    apis: ['./src/routes/*.js']
}
const swaggerSpec = swaggerJSDoc(options)

server.use('/docs/swagger', swaggerUI.serve, swaggerUI.setup(swaggerSpec) )
server.use('/', userRouter);
server.use('/', orderRouter);
server.use('/', authRouter);



server.get('/', (req, res)=> {
    res.send('Bienvenido');
});

server.listen(port, ()=> {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
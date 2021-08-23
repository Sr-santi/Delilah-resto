const express = require('express');
const helmet = require('helmet');
const bodyparser = require('body-parser');

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const userRouter = require('./routes/users');
const orderRouter = require('./routes/orders');
const productRouter = require('./routes/products')
const authRouter = require('./routes/auth');

const port = 3000;
const swaggerDefinition = require('./swaggerDefinition');
const options = {
    ...swaggerDefinition,
    apis: ['./src/routes/*.js']
}
const swaggerSpec = swaggerJSDoc(options);

const server = express();
server.use(bodyparser.json());
server.use(helmet());

server.use('/docs/swagger', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
server.use('/', userRouter);
server.use('/', orderRouter);
server.use('/', productRouter);
server.use('/', authRouter);

server.get('/', (req, res)=> {
    res.send('Bienvenido');
});

server.get('/api-docs.json', (req, res) => {
    res.send(swaggerSpec);
});

server.listen(port, ()=> {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
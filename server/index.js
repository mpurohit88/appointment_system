const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

const { env } = require("./lib/databaseMySQL");
const mainRoute = require('./routes/mainRoute');
const appointmentRouter = require('./routes/appointment');

app.use('/api/appointment', appointmentRouter);
app.use('/',mainRoute);

let port ='';

if(env === 'local'){
    port = 5000;
}else if(env === 'prod'){
    port = 3007;
}


const server = http.createServer(app);
server.listen(port, () => {
    console.log('server is running on port: ', port);    
});
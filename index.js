//richiamo i moduli necessari

const express = require('express');

const cors = require('cors');

const { MongoClient } = require('mongodb');

const { urlencoded } = require('express');

const routes = require('./modules/routes');

const dotenv = require('dotenv');

const cookieParser = require('cookie-parser');

//inizializzo express e abilito le cors

const app = express();

app.use(cors());

app.use(cookieParser());

dotenv.config();

//connetto al database

const uri = 'mongodb://127.0.0.1:27017';

const client = new MongoClient(uri);

const database = client.db('esercizio');

app.use(express.json());
app.use(urlencoded({ extended : true }));

//avvio app su porta 4000

app.listen(4000, () => {

console.log('Il server è avviato su porta 4000')

} );

routes.routes(app, client, database);


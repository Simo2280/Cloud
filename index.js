//richiamo i moduli necessari

const db = require('./modules/models/database')

const express = require('express');

const cors = require('cors');

const { urlencoded } = require('express');

const routes = require('./modules/routes');

const dotenv = require('dotenv');

const cookieParser = require('cookie-parser');

const bodyParser = require('body-parser');

//inizializzo express e abilito le cors

const app = express();

app.use(cors());

app.use(cookieParser());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

dotenv.config();

//connetto al database

db();

app.use(express.json());
app.use(urlencoded({ extended : true }));

//avvio app su porta 4000

app.listen(4000, () => {

console.log('Il server è avviato su porta 4000')

} );

routes.routes(app);


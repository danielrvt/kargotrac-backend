
require('dotenv').config()
const db = require("./models")
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});


app.use(bodyParser.json())
app.use(require('./api/user'))


db.sequelize.sync().then(() => {
    console.log("ACK")
})

app.listen(process.env.PORT, () => console.log("App listening on port 8080!"))


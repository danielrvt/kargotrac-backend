
require('dotenv').config()
const db = require("./models")
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.use(cors())
app.use(bodyParser.json())
app.use(require('./api/user'))


db.sequelize.sync().then(() => {
    console.log("ACK")
})

app.listen(process.env.PORT, () => console.log("App listening on port 8080!"))


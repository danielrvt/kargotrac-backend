
require('dotenv').config()
const db = require("./models")
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

//app.use(cors({credentials: true, origin: true}))
const options = {
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token", "Access-Control-Allow-Origin"],
    credentials: true,
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
    origin: true,
    preflightContinue: false
};

//use cors middleware
app.use(cors(options));


app.use(bodyParser.json())
app.use(require('./api/user'))


db.sequelize.sync().then(() => {
    console.log("ACK")
})

app.listen(process.env.PORT, () => console.log("App listening on port 8080!"))


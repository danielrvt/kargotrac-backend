const db = require("./models")
const express = require('express')
const bodyParser = require('body-parser')

const app = express()


app.use(bodyParser.json())

app.use(require('./api/user'))


db.sequelize.sync().then(() => {
    console.log("ACK")
})

app.listen(8080, () => console.log("App listening on port 8080!"))


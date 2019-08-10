
const userController = require('../controllers/user')
const itemController = require('../controllers/item')
const companyController = require('../controllers/company')
const express = require('express')
const router = express.Router()
const { body } = require('express-validator/check')
const cors = require("cors");


//options for cors midddleware
const options = {
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token", "Access-Control-Allow-Origin"],
    credentials: true,
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
    origin: "*",
    preflightContinue: false
};

//use cors middleware
router.use(cors(options));

//add your routes

router.get('/', (req, res) => {
    
    res.json(`Welcome to Kargotrack, the server is running in ${process.env.PORT} port`)
})

router.post(
    '/register',
    userController.validate('createUser'),
    userController.createUser
)

router.post(
    '/registerCompany',
    companyController.createCompany
)

router.post(
    '/users',
    userController.login
)

router.patch(
    '/users/me',
    userController.editUser
)

router.get(
    '/users/me',
    userController.getUser
)

router.post(
    '/items',
    itemController.createItem
)

router.get(
    '/items',
    itemController.getItems
)

router.patch(
    '/items',
    itemController.editItem
)

router.delete(
    '/items',
    itemController.deleteItems
)
//enable pre-flight
router.options("*", cors(options));

module.exports = router


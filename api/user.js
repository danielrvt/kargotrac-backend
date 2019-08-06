
const userController = require('../controllers/user')
const itemController = require('../controllers/item')
const companyController = require('../controllers/company')
const express = require('express')
const router = express.Router()
const { body } = require('express-validator/check')
const cors = require("cors");


//options for cors midddleware
const options = {
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token"],
    credentials: true,
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
    origin: 'http://localhost:3001',
    preflightContinue: false
};

//use cors middleware
router.use(cors(options));

//add your routes


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
//enable pre-flight
router.options("*", cors(options));

module.exports = router


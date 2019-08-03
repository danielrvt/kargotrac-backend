
const userController = require('../controllers/user')
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
    origin: true,
    preflightContinue: false
};

//use cors middleware
//router.use(cors(options));

//add your routes



router.post(
    '/register',
    cors(),
    userController.validate('createUser'),
    userController.createUser
)

router.post(
    '/registerCompany',
    cors(),
    companyController.createCompany
)

router.post(
    '/users',
    cors(),
    userController.login
)

router.patch(
    '/users/me',
    cors(),
    userController.editUser
)

router.get(
    '/users/me',
    cors(),
    userController.getUser
)
//enable pre-flight
//router.options("*", cors(options));

module.exports = router


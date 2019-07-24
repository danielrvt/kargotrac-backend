
const userController = require('../controllers/user')
const companyController = require('../controllers/company')
const express = require('express')
const router = express.Router()
const { body } = require('express-validator/check')


router.post(
    '/register',
    userController.validate('createUser'), 
    userController.createUser
)

router.post(
    '/registerCompany',
    companyController.createCompany
)


module.exports = router



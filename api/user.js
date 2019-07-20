
const userController = require('../controllers/user')
const express = require('express')
const router = express.Router()
const { body } = require('express-validator/check')


router.post(
    '/register',
    userController.validate('createUser'), 
    userController.createUser
)

module.exports = router



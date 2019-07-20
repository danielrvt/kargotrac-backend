
var User = require('../models/user')
const { check, validationResult } = require('express-validator');
const db = require('../models/index.js')


exports.validate = (method) => {
    switch (method) {
        case 'createUser': {
            return [
                check('email').isEmail(),
                check('password').isLength({ min: 5 })
            ]
        }
    }
}


exports.createUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ errors: errors.array() });
            return;
        }

        const { firstName, lastName, email, password } = req.body
        if (!isEmailUnique(email)) {
            res.send("El email no es unico")
            return;
        }
        const user = await User.create({

            firstName,

            lastName,

            email,

            password
        })
        res.json(user)
    } catch (err) {
        return next(err)
    }
}

// exports.loginUser = 

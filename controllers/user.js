
const { check, validationResult } = require('express-validator');
const db = require('../models/index.js')
const User = require('../models').Users;

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

const isUnique = (email,username) => {
    User.findAll({
        where: {
            email: email,
            username: username
        }
    }).done(function(error, user) {

        if (error)
            return console.log(error);

        if (user)
            // We found a user with this email address.
            // Pass the error to the next method.
            return res.json("El email o user no son unicos");
        next();

    });
}

exports.createUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ errors: errors.array() });
            return;
        }
        const { email, username, password } = req.body

        isUnique(email,username)

        const user = await User.create({

            email,

            username,

            password
        })
        // Debo agregar a userscompany el id que traiga
        res.json(user)
    } catch (err) {
        return next(err)
    }
}

// exports.loginUser = 

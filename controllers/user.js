
const { check, validationResult } = require('express-validator');
const User = require('../models').Users;
const Company = require('../models').Companies;
const usersCompany = require('../models').usersCompanies;
const usersCompanyCont = require('./userscompany')
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');

const jwtMW = exjwt({
    secret: 'whatever it takes'
});
/*
DESCRIPTION: validates email and password (does not check if email exists)
 */
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

/****************************** USER SIGNUP ****************************/


/* Esta funcion chequa los formatos de email y password y controla las llamadas para el
proceso de agregar un usuario */

exports.createUser = (req, res) => {

    try {
        
        const { email, username, password, companyID } = req.body
        // Chequeo si la compania existe
        ckeckIfCompExist(companyID).then((exist) => {

            if (exist) {

                // Chequeo si el email existe
                checkifExistEmail(email).then((result) => {
                    // Luego chequeo si el username existe

                    // Luego: 
                    // Si el username existe (email no existe) y coincide la contrasena => Lo dejo entrar
                    // Si el email existe (username no existe) y coincide la contrasena => Lo dejo entrar
                    // Si ambos existen y coincide la contrasena => Lo dejo entrar
                    // Si ambos no existen => creo un usuario nuevo
                    // Si alguno existe pero no coincide la contrasena => user/email taken
                    // Si ambos existen y no coincide la contrasena => user/email taken?

                    const existEmail = result.exist
                    const user = result.user
                    console.log('Este es el usuario')
                    console.log(user)
                    checkIfExistUsername(username).then((resultUsername) => {
                        const existUsername = resultUsername.exist
                        const user_username = resultUsername.user

                        if (existEmail && existUsername) {

                            if (user.dataValues.password === password) {
                                // Debo chequear que la compania exista
                                usersCompanyCont.createUsersCompany(user.dataValues.id, companyID).then((resp) => {
                                    console.log("Esta es la resssspppp")
                                    console.log(resp)
                                })
    
                                let token = jwt.sign({ id: user.id, email: user.email }, 'whatever it takes', { expiresIn: 129600 }); // Sigining the token
                                res.json({ status: 'success', user: user.dataValues, company: companyID, token: token })
                            }
    
                            else res.json({ status: 'failed', msg: 'User taken' })
                        }
                        else {
                            existUsername && !existEmail  || existEmail && !existUsername  ? res.json({ status: 'failed', msg: 'User taken' }) :
                            createNewUser(email, username, password, companyID, res)
                        }

                    })
                    
                })

            } else {
                res.json({ status: 'failed', msg: 'Company does not exist' })
            }
        })



    } catch (err) {
        return console.log(err)
    }
}



/*
DESCRIPTION: finds if email exists, if exists then calls next ==> next checks if email and password match in db
if does not exist then calls createNewUser and continues 
 */
/*
CASO BASE: el email es unico (no existe en la bd) => Agrego ***************LISTO**************
                                                            1) El usuario en la base de datos
                                                            2) El usuario + comania en la relacion usersCompanies
CASO 1: el email existe y coincide con la contrasena en la BD => 
                                                            1) Agrego en la tabla usersCompany que ya maneja que el usuario ya
                                                            tenga esa compania. Si no esta enviar response de que ya posee la compania
CASO 2: el email existe pero la contrasena no coincide con la bd => 
                                                            1) Enviar response que diga eso

 */

/* Esta funcion chequea si existe el email, sino continua con agregar un nuevo usuario */
const checkifExistEmail = (email) => {
   
    return (User.findAll({
        where: {
            email: email
        }
    })).then(function (user) {

        if (user.length > 0) // Aqui debo manejar que si el email y contrasena coinciden, entonces le agrego el companyID
            return { exist: true, user: user[0] }
        else return { exist: false, user: null }
        // Falta probar agregando una nueva empresa
        // Debo agregarle el response a la empresa


    })

}

const checkIfExistUsername = (username) => {
    return (User.findAll({
        where: {
            username:username
        }
    })).then(function (user) {

        if (user.length > 0) // Aqui debo manejar que si el email y contrasena coinciden, entonces le agrego el companyID
            return { exist: true, user: user[0] }
        else return { exist: false, user: null }
        // Falta probar agregando una nueva empresa
        // Debo agregarle el response a la empresa


    })
}

/* Esta funcion agrega el nuevo usuario en la bd */
const createNewUser = async (email, username, password, companyID, response) => {
    try {
        const user = await User.create({

            email,

            username,

            password
        })
        usersCompanyCont.createUsersCompany(user.id, companyID)
        let token = jwt.sign({ id: user.dataValues.id, email: user.dataValues.email }, 'whatever it takes', { expiresIn: 129600 }); // Sigining the token
        response.json({
            status: 'success',
            user: user,
            company: companyID,
            token: token
        })
    } catch (e) {
        console.log(e)
        console.log('Error caught');
    }
}

/****************************** USER LOGIN ****************************/

// Por ahora, dejo iniciar sesion asi no tenga compania --> no se que oasa que no carga si le paso el id de la compania

exports.login = (req, res) => {

    try {

        const { email, password, companyID } = req.body

        ckeckIfCompExist(companyID).then((companyExist) => {
            if (companyExist) {
                checkIfExist(email, null).then((result) => {
                    const exist = result.exist
                    const user = result.user

                    if (exist) {

                        if (user.dataValues.password === password) {

                            if (companyID) {
                                checkIfCompMatch(user.dataValues.id, companyID).then((match) => {

                                    if (match) {
                                        let token = jwt.sign({ id: user.dataValues.id, username: user.dataValues.username }, 'whatever it takes', { expiresIn: 129600 }); // Sigining the token
                                        res.json({ user: user.dataValues, companyID: null, token: token })
                                    } else res.json({ status: 'failed', msg: 'User is not associated to that company' })
                                })
                            } else {
                                let token = jwt.sign({ id: user.dataValues.id, username: user.dataValues.username }, 'whatever it takes', { expiresIn: 129600 }); // Sigining the token
                                res.json({ status: 'success', user: user.dataValues, companyID: null, token: token })
                            }


                        }
                        else res.json({ status: 'failed', msg: 'Wrong password' })
                    } else {
                        res.json({ status: 'failed', msg: 'User does not exist' })
                    }
                })

            } else res.json({ status: 'failed', msg: 'Company does not exist' })


        })


    } catch (err) {
        return console.log(err)
    }
}

// Para cuando le pase la compania por login ==> debo chequear si tiene la compania asociada
const checkIfCompMatch = (userID, companyID) => {

    return (usersCompany.findAll({
        where: {
            userID: userID,
            companyID: companyID
        }
    })).then(function (user) {

        if (user.length > 0)
            return true
        else return false
    })

}

const ckeckIfCompExist = (companyID) => {
    return (Company.findAll({
        where: {
            id: companyID
        }
    })).then(function (company) {

        if (company.length > 0)
            return true
        else return false
    })

}
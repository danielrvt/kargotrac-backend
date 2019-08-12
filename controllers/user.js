
const { check, validationResult } = require('express-validator');
const User = require('../models').Users;
const Company = require('../models').Companies;
const usersCompany = require('../models').usersCompanies;
const Packages = require('../models').Package;
const Items = require('../models').Item;
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

                    const existEmail = result.exist
                    const user = result.user

                    checkIfExistUsername(username).then((resultUsername) => {
                        const existUsername = resultUsername.exist

                        if (existEmail && existUsername) {

                            if (user.dataValues.password === password) {
                                // Debo chequear que la compania exista
                                usersCompanyCont.createUsersCompany(user.dataValues.id, companyID).then((resp) => {
                                    console.log(resp)
                                    if (!resp) res.json({ status: 'failed', msg: 'Company already associated with user. Go to login' })
                                    else {
                                        // Debo buscar la compania que agregue para hacerle push a userscompanies
                                        findUsersCompanies(user.dataValues.id).then((companies) => {
                                            console.log("Companies")
                                            console.log(companies)
                                            let token = jwt.sign({ id: user.dataValues.id, username: user.dataValues.username }, 'whatever it takes', { expiresIn: 129600 }); // Sigining the token
                                            res.json({ status: 'success', user: user.dataValues, companyID: companyID, token: token, usersCompanies: companies })

                                        })
                                    }
                                })

                            }

                            else res.json({ status: 'failed', msg: 'User taken' })
                        }
                        else {
                            existUsername && !existEmail || existEmail && !existUsername ? res.json({ status: 'failed', msg: 'User taken' }) :
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
            username: username
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
        usersCompanyCont.createUsersCompany(user.id, companyID).then((company) => {
            let token = jwt.sign({ id: user.dataValues.id, username: user.dataValues.username }, 'whatever it takes', { expiresIn: 129600 }); // Sigining the token
            response.json({ status: 'success', user: user.dataValues, companyID: companyID, token: token, usersCompanies: [company] })
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
        checkifExistEmail(email).then((result) => {
            const exist = result.exist
            const user = result.user

            if (exist) {

                if (user.dataValues.password === password) {

                    findUsersCompanies(user.dataValues.id).then((companies) => {
                        console.log("!!!!!!!!!!!!!!!!!!")
                        console.log(companies)
                        if (companies) {
                            // Debo convertir usersCompanies a 
                            if (companyID) {
                                checkIfCompMatch(user.dataValues.id, companyID).then((match) => {
                                    if (match) {
                                        let token = jwt.sign({ id: user.dataValues.id, username: user.dataValues.username }, 'whatever it takes', { expiresIn: 129600 }); // Sigining the token
                                        res.json({ status: 'success', user: user.dataValues, companyID: companyID, token: token, usersCompanies: companies })
                                    }
                                    else res.json({ status: 'failed', msg: 'User is not associated to that company or the company does not exist' })
                                })
                            } else {
                                let token = jwt.sign({ id: user.dataValues.id, username: user.dataValues.username }, 'whatever it takes', { expiresIn: 129600 }); // Sigining the token
                                res.json({ status: 'success', user: user.dataValues, companyID: companies[0].dataValues.companyID, token: token, usersCompanies: companies })
                            }

                        } else {
                            res.json({ status: 'failed', msg: 'User is not associated to a company' })
                        }
                    })


                }
                else res.json({ status: 'failed', msg: 'Wrong password' })
            } else {
                res.json({ status: 'failed', msg: 'User does not exist' })
            }
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

const findUsersCompanies = (userID) => {
    return (usersCompany.findAll({
        where: {
            userID: userID
        }
    })).then(function (companies) {

        if (companies.length > 0)
            return companies
        else return ''
    })
}
exports.editUser = (req, res) => {

    const token = req.headers
    const updates = req.body
    let addressUpdated = false;
    let phone1Updated = false;
    let phone2Updated = false;
    console.log('Estos son los upt')
    console.log(updates)
    console.log(token.usertoken)
    //res.json({ status: 'success', user: null, companyID: null, token: token })
    console.log('COMPANY ID')
    console.log(token.companyid)
    try {
        decoded = jwt.verify(token.usertoken, 'whatever it takes');
        console.log(decoded)
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    const userID = decoded.id
    User.findOne({ where: { id: userID } }).then(function (user) {
        if (updates.address && updates.address.length > 0) {
            addressUpdated = true
            User.update(
                { address: updates.address },
                { where: { id: userID } }
            ).then(() => { console.log('address updated') })
        }
        if (updates.phone1 && updates.phone1.length > 0) {
            phone1Updated = true;
            User.update(
                { phone1: updates.phone1 },
                { where: { id: userID } }
            ).then(() => { console.log('phone1 updated') })
        }
        if (updates.phone2 && updates.phone2.length > 0) {
            phone2Updated = true
            User.update(
                { phone2: updates.phone2 },
                { where: { id: userID } }
            ).then(() => { console.log('phone2 updated') })
        }
        //window.alert(user)
        //return res.json(user);
        console.log('Este es el usuario actualizado')
        console.log(user)
        res.json({ status: 'success', user: user.dataValues, companyID: token.companyid, token: token.usertoken })
        //res.json(user)
    }, function (e) { res.json(e) });

}

const update = (updatedAtt, value, userID) => {
    User.update(
        { [updatedAtt]: value },
        { where: { id: userID } }
    )
        .then(function (rowsUpdated) {
            res.json(rowsUpdated)
        }, function (e) { console.log(e) })

}

exports.getUser = (req, res) => {

    const token = req.headers
    const updates = req.body

    console.log('Estos son los upt')
    console.log(updates)
    console.log(token.usertoken)
    //res.json({ status: 'success', user: null, companyID: null, token: token })

    try {
        decoded = jwt.verify(token.usertoken, 'whatever it takes');
        console.log(decoded)
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    const userID = decoded.id
    console.log(userID)
    User.findOne({ where: { id: userID } }).then(function (user) {
        console.log('Este es el usuario')
        console.log(user)
        res.json({ status: 'success', user: user.dataValues, companyID: token.companyid, token: token.usertoken })
    });

}



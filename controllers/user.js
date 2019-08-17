
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

        ckeckIfCompExist(companyID).then((exist) => {

            if (exist) {

                checkifExistEmail(email).then((result) => {

                    const existEmail = result.exist
                    const user = result.user

                    checkIfExistUsername(username).then((resultUsername) => {
                        const existUsername = resultUsername.exist

                        if (existEmail && existUsername) {

                            if (user.dataValues.password === password) {

                                usersCompanyCont.createUsersCompany(user.dataValues.id, companyID).then((resp) => {

                                    if (!resp) res.json({ status: 'failed', msg: 'Company already associated with user. Go to login' })
                                    else {

                                        findUsersCompanies(user.dataValues.id).then((companies) => {
                                            console.log("AQIO COMPANIES")
                                            console.log(companies)
                                            const compIndex = companies.findIndex((cmp) => {
                                                return cmp.id === parseInt(companyID)

                                            })
                                            let token = jwt.sign({ id: user.dataValues.id, username: user.dataValues.username }, 'whatever it takes', { expiresIn: 129600 }); // Sigining the token
                                            res.json({ status: 'success', user: user.dataValues, company: companies[compIndex], token: token, usersCompanies: companies })

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

        if (user.length > 0)
            return { exist: true, user: user[0] }
        else return { exist: false, user: null }


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
            Company.findOne({
                where: {
                    id: company.companyID
                }
            }).then((cmp) => {
                console.log(cmp)
                let token = jwt.sign({ id: user.dataValues.id, username: user.dataValues.username }, 'whatever it takes', { expiresIn: 129600 }); // Sigining the token
                response.json({ status: 'success', user: user.dataValues, company: cmp.dataValues, token: token, usersCompanies: [cmp] })
            })

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

                        if (companies) {

                            if (companyID) {

                                checkIfCompMatch(user.dataValues.id, companyID).then((match) => {

                                    if (match) {

                                        let compIndex = companies.findIndex((cmp) => {
                                            return cmp.id === parseInt(companyID)

                                        })
                                        let token = jwt.sign({ id: user.dataValues.id, username: user.dataValues.username }, 'whatever it takes', { expiresIn: 129600 }); // Sigining the token
                                        res.json({ status: 'success', user: user.dataValues, company: companies[compIndex], token: token, usersCompanies: companies })
                                    }

                                    else res.json({ status: 'failed', msg: 'User is not associated to that company or the company does not exist' })
                                })

                            } else {
                                console.log("ESTAS SON LAS COMPANIAS")
                                console.log(companies)
                                let token = jwt.sign({ id: user.dataValues.id, username: user.dataValues.username }, 'whatever it takes', { expiresIn: 129600 }); // Sigining the token
                                res.json({ status: 'success', user: user.dataValues, company: companies[0], token: token, usersCompanies: companies })
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
            userID: parseInt(userID),
            companyID: parseInt(companyID)
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
            id: parseInt(companyID)
        }
    })).then(function (company) {

        if (company.length > 0)
            return true
        else return false
    })

}

const findUsersCompanies = async (userID) => {
    let companiesInfo = []
    return Promise.resolve(usersCompany.findAll({
        where: {
            userID: userID
        }
    })).then(function (companies) {
        if (companies.length > 0) {
            
            let promiseCompany = companies.map((company) => {
                return Company.findOne({
                    where: {
                        id: company.companyID
                    }
                }).then((companyInfo) =>
                    companiesInfo.push(companyInfo.dataValues)
                )
            })

           return  Promise.resolve(Promise.all(promiseCompany).then(() => {
                console.log(companiesInfo)
                return companiesInfo
            }))
        }
        else return false
    })
}
exports.editUser = (req, res) => {

    const token = req.headers
    const updates = req.body

    try {
        decoded = jwt.verify(token.usertoken, 'whatever it takes');
        console.log(decoded)
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    const userID = decoded.id
    const isCompany = token.iscompany
    const companyID = token.companyid
    console.log(updates)
    if (isCompany === 'false') {
        User.findOne({ where: { id: userID } }).then(function (user) {

            if (updates.address !== user.dataValues.address) {
                addressUpdated = true
                User.update(
                    { address: updates.address },
                    { where: { id: userID } }
                ).then(() => { console.log('address updated') })
            }

            if (updates.phone1 !== user.dataValues.phone1) {
                phone1Updated = true;
                User.update(
                    { phone1: updates.phone1 },
                    { where: { id: userID } }
                ).then(() => { console.log('phone1 updated') })
            }

            if (updates.phone2 !== user.dataValues.phone2) {
                phone2Updated = true
                User.update(
                    { phone2: updates.phone2 },
                    { where: { id: userID } }
                ).then(() => { console.log('phone2 updated') })
            }

            res.json({ status: 'success', user: user.dataValues, companyID: token.companyid, token: token.usertoken })

        }, function (e) { res.json(e) });
    } else {
        Company.findOne({
            where: {
                id: parseInt(companyID)
            }
        }).then((company) => {

            if (updates.address !== company.dataValues.address) {
                addressUpdated = true
                Company.update(
                    { address: updates.address },
                    { where: { id: companyID } }
                ).then(() => { console.log('address updated') })
            }

            if (updates.phone1 !== company.dataValues.phone) {
                phone1Updated = true;
                Company.update(
                    { phone1: updates.phone1 },
                    { where: { id: companyID } }
                ).then(() => { console.log('phone1 updated') })
            }

            if (updates.logo !== company.dataValues.logo) {
                phone1Updated = true;
                Company.update(
                    { logo: updates.logo },
                    { where: { id: companyID } }
                ).then(() => { console.log('phone1 updated') })
            }

            if (updates.primary_color !== company.dataValues.primary_color) {
                phone1Updated = true;
                Company.update(
                    { primary_color: updates.primary_color },
                    { where: { id: companyID } }
                ).then(() => { console.log('phone1 updated') })
            }

            if (updates.secondary_color !== company.dataValues.secondary_color) {
                phone1Updated = true;
                Company.update(
                    { secondary_color: updates.secondary_color },
                    { where: { id: companyID } }
                ).then(() => { console.log('phone1 updated') })
            }

            if (updates.pvl_factor && parseFloat(updates.pvl_factor) !== company.dataValues.pvl_factor) {
                phone1Updated = true;
                Company.update(
                    { pvl_factor: parseFloat(updates.pvl_factor) },
                    { where: { id: companyID } }
                ).then(() => { console.log('phone1 updated') })
            }

            if (updates.maritime_cubic_feet_price && parseFloat(updates.maritime_cubic_feet_price) !== company.dataValues.maritime_cubic_feet_price) {
                phone1Updated = true;
                Company.update(
                    { maritime_cubic_feet_price: parseFloat(updates.maritime_cubic_feet_price) },
                    { where: { id: companyID } }
                ).then(() => { console.log('phone1 updated') })
            }

            if (updates.air_pound_price && parseFloat(updates.air_pound_price) !== company.dataValues.air_pound_price) {
                phone1Updated = true;
                Company.update(
                    { air_pound_price: parseFloat(updates.air_pound_price) },
                    { where: { id: companyID } }
                ).then(() => { console.log('phone1 updated') })
            }

            res.json({ status: 'success', user: company.dataValues, companyID: token.companyid, token: token.usertoken })

        })
    }


}


exports.getUser = (req, res) => {

    const token = req.headers
    const updates = req.body


    try {
        decoded = jwt.verify(token.usertoken, 'whatever it takes');
        console.log(decoded)
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    const userID = decoded.id
    const isCompany = token.iscompany

    if (isCompany === 'false') {
        console.log(userID)
        User.findOne({ where: { id: userID } }).then(function (user) {
            console.log('Este es el usuario')
            console.log(user)
            res.json({ status: 'success', user: user.dataValues, companyID: token.companyid, token: token.usertoken })
        });

    } else {
        Company.findOne({
            where: {
                id: token.companyid
            }
        }).then((company) => {
            res.json({ status: 'success', user: company.dataValues, token: token.usertoken })
        })
    }

}



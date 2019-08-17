
const Company = require('../models').Companies;
const jwt = require('jsonwebtoken');

exports.createCompany = async (req, res, next) => {
    try {

        const {email, username, password} = req.body
        const company = await Company.create({

            email,

            username,

            password
        })

        res.json(company)
    } catch (err) {
        return next(err)
    }
}

exports.loginCompany = (req, res) => {

    const {email, password } = req.body
    const headers = req.headers
    console.log(headers.id)
    Company.findOne({
        where: {
            email: email
        }
    }).then((company) => {

        if(company && company.dataValues.password === password){

            if(company.dataValues.id === parseInt(headers.id)){
                let token = jwt.sign({ id: company.dataValues.id, username: company.dataValues.username }, 'whatever it takes', { expiresIn: 129600 }); // Sigining the token
                res.json({ status: 'success', company: company.dataValues, token: token, isCompany: true})
            }else res.json({ status: 'failed', msg: "Wrong id"})

        }else res.json({ status: 'failed', msg: "Wrong password"})
    })
}

exports.getCompany = (id) => {

    Company.findOne({
        where: {
            id: parseInt(id)
        }
    }).then((company) => {

        if(company) return company.dataValues
        else return false
    })
}

const Company = require('../models').Companies;

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

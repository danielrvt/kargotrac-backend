const Sequelize = require('sequelize')
const db = require('./index.js')

module.exports = db.sequelize.define('User', {
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {freezeTableName: true})
  
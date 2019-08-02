'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js');
const db = {};
<<<<<<< HEAD


var database = process.env.DATABASE_URL || 'kargotrack_db'
console.log('DATABASEEEEE')
console.log(database)
var sequelize = ""

if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(database)
=======
console.log('Aqui toy')
console.log(process.env['DIALECT'])
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config,
    {dialect: 'mysql'});
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config,  {dialect: 'mysql'});
>>>>>>> fixes
}
else {
    sequelize = new Sequelize(database, 'mysql', '', {
        dialect: 'mysql'
    });
}
/*
var sequelize = new Sequelize(config.database, config.username, config.password,
  {
    host: config.host,
    dialect: 'mysql'
  });
*/

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

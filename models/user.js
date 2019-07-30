'use strict';
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true},

    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true},

    password: {
      type: DataTypes.STRING,
      allowNull: false},

    address: DataTypes.STRING,
    phone1: DataTypes.STRING,
    phone2: DataTypes.STRING
  }, {});
  Users.associate = function(models) {
    Users.belongsToMany(models.Companies, {
      through: 'usersCompanies',
      as: 'Companies',
      foreignKey: 'userID'
    });
  };
  return Users;
};
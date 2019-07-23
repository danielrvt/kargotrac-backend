'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('Users', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true},

    username: {
      type: DataTypes.STRING,
      unique: true},

    password: {
      type: DataTypes.STRING,
      allowNull: false},

    address: DataTypes.STRING,
    phone1: DataTypes.STRING,
    phone2: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    User.belongsToMany(models.Companies, {
      through: 'usersCompanies',
      as: 'Companies',
      foreignKey: 'userID'
    });
  };
  return User;
};
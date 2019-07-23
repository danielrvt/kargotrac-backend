'use strict';
module.exports = (sequelize, DataTypes) => {
  const company = sequelize.define('company', {
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    address: DataTypes.STRING,
    phone1: DataTypes.STRING,
    logo: DataTypes.STRING,
    primary_color: DataTypes.STRING,
    secondary_color: DataTypes.STRING,
    pvl_factor: DataTypes.DOUBLE,
    maritime_cubic_feet_price: DataTypes.DOUBLE,
    air_pound_price: DataTypes.DOUBLE
  }, {});
  company.associate = function(models) {
    // associations can be defined here
  };
  return company;
};
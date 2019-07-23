'use strict';
module.exports = (sequelize, DataTypes) => {
  const Companies = sequelize.define('Companies', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }, username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: DataTypes.STRING,
    phone1: DataTypes.STRING,
    logo: DataTypes.STRING,
    primary_color: DataTypes.STRING,
    secondary_color: DataTypes.STRING,
    pvl_factor: DataTypes.DOUBLE,
    maritime_cubic_feet_price: DataTypes.DOUBLE,
    air_pound_price: DataTypes.DOUBLE
  }, {});
  Companies.associate = function (models) {
    Companies.belongsToMany(models.Users, {
      through: 'usersCompanies',
      as: 'Users',
      foreignKey: 'companyID'
    });
  };
  return Companies;
};
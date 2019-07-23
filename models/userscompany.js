'use strict';
module.exports = (sequelize, DataTypes) => {
  const usersCompany = sequelize.define('usersCompanies', {
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
    }},
    companyID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
          model: 'Companies',
          key: 'id'
      }
    }
  }, {});
  usersCompany.associate = function(models) {
    // associations can be defined here
  };
  return usersCompany;
};
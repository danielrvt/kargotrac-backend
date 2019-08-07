'use strict';
module.exports = (sequelize, DataTypes) => {
  const Packages = sequelize.define('Packages', {
    tracking_id: DataTypes.STRING,
    seller: DataTypes.STRING,
    status: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    CompanyId: DataTypes.INTEGER
  }, {});
  Packages.associate = function(models) {
    // associations can be defined here
    Packages.belongsTo(models.Users, {foreignKey: 'UserId'})
    Packages.belongsTo(models.Companies, {foreignKey: 'CompanyId'})
  };
  return Packages;
};
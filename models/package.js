'use strict';
module.exports = (sequelize, DataTypes) => {
  const Packages = sequelize.define('Packages', {
    tracking_id: DataTypes.STRING,
    seller: DataTypes.STRING,
    status: DataTypes.STRING
  }, {});
  Packages.associate = function(models) {
    // associations can be defined here
    Packages.hasMany(models.Items)
  };
  return Packages;
};
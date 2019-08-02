'use strict';
module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define('Package', {
    tracking_id: DataTypes.STRING,
    seller: DataTypes.STRING,
    status: DataTypes.STRING
  }, {});
  Package.associate = function(models) {
    // associations can be defined here
    Package.hasMany(models.Item)
  };
  return Package;
};
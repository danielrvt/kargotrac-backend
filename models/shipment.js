'use strict';
module.exports = (sequelize, DataTypes) => {
  const Shipments = sequelize.define('Shipments', {
    lbs_weight: DataTypes.DOUBLE,
    pvl_weight: DataTypes.DOUBLE,
    cubic_feet_volume: DataTypes.DOUBLE,
    number_of_boxes: DataTypes.INTEGER,
    shipping_way: DataTypes.STRING,
    status: DataTypes.STRING
  }, {});
  Shipments.associate = function(models) {
    // associations can be defined here
    Shipments.hasMany(models.Items)
  };
  return Shipments;
};
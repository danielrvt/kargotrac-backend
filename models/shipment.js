'use strict';
module.exports = (sequelize, DataTypes) => {
  const Shipment = sequelize.define('Shipment', {
    lbs_weight: DataTypes.DOUBLE,
    pvl_weight: DataTypes.DOUBLE,
    cubic_feet_volume: DataTypes.DOUBLE,
    number_of_boxes: DataTypes.INTEGER,
    shipping_way: DataTypes.STRING,
    status: DataTypes.STRING
  }, {});
  Shipment.associate = function(models) {
    // associations can be defined here
    Shipment.hasMany(models.Item)
  };
  return Shipment;
};
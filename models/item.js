'use strict';
module.exports = (sequelize, DataTypes) => {
  const Items = sequelize.define('Items', {
    name: {
      type: DataTypes.STRING,

    },
    quantity: {
      type: DataTypes.INTEGER,

    }, 
    PackageId: DataTypes.INTEGER,
    ShipmentId: DataTypes.INTEGER
  }, {});
  Items.associate = function (models) {
    Items.belongsTo(models.Packages, {foreignKey: 'PackageId'})
    Items.belongsTo(models.Shipments, {foreignKey: 'ShipmentId'})
    // associations can be defined here
  };
  return Items;
};
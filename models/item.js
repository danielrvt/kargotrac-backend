'use strict';
module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define('Item', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
  Item.associate = function (models) {
    Item.belongsTo(models.Package)
    Item.belongsTo(models.Shipment)
    // associations can be defined here
  };
  return Item;
};
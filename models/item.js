'use strict';
module.exports = (sequelize, DataTypes) => {
  const Items = sequelize.define('Items', {
    name: {
      type: DataTypes.STRING,

    },
    quantity: {
      type: DataTypes.INTEGER,

    },
    companyID: {
      type: DataTypes.INTEGER,

    }, 
  }, {});
  Items.associate = function (models) {
    Items.belongsTo(models.Packages, { as: 'Packages', foreignKey: 'id' })
    Items.belongsTo(models.Shipments)
    Items.belongsTo(models.Users, { as: 'User', foreignKey: 'id' })
    // associations can be defined here
  };
  return Items;
};
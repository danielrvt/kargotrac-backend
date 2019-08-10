'use strict';
module.exports = (sequelize, DataTypes) => {
  const Items = sequelize.define('Items', {
    name: {
      type: DataTypes.STRING,

    },
    quantity: {
      type: DataTypes.INTEGER,

    }, 
    PackageId: DataTypes.INTEGER
  }, {});
  Items.associate = function (models) {
    Items.belongsTo(models.Packages, {foreignKey: 'PackageId'})
    // associations can be defined here
  };
  return Items;
};
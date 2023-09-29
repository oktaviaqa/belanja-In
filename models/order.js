'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.Client);
      Order.belongsTo(models.Driver);
      Order.hasMany(models.OrderStore);
    }
  }
  Order.init({
    detailOrder: DataTypes.STRING,
    priceItem: DataTypes.INTEGER,
    totalItem: DataTypes.INTEGER,
    totalPrice: DataTypes.INTEGER,
    ClientId: DataTypes.INTEGER,
    DriverId: DataTypes.INTEGER,
  }, {
    hooks: {
      beforeCreate: (order, options) => {
        order.totalPrice = Math.floor(parseFloat(Number((order.priceItem*order.totalItem) * 1.1)))
      }
    },
    sequelize,
    modelName: 'Order',
  });
  return Order;
};
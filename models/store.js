const rupiahFormat = require('../helpers/helper')

'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Store extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Store.hasMany(models.OrderStore);
    }
    static toRp(value){
      return rupiahFormat(value)
    }
    get toRupiah() {
      return rupiahFormat(this.price)
    }
  }
  Store.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.INTEGER
  }, { 
    sequelize,
    modelName: 'Store',
  });
  return Store;
};
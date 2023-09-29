'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Driver extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Driver.hasOne(models.Account);
      Driver.hasOne(models.Order);
    }
  }
  Driver.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "First name cannot be empty"
        },
        notEmpty: {
          msg: "First name cannot be empty"
        },
        isSingleWord(value) {
          if (/\s/.test(value)) {
            throw new Error("First name must be a single word");
          }
        }
      }
    },    
    lastName:  {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        notNull: {
          msg: "Last name cannot be empty"
        },
        notEmpty: {
          msg: "Last name cannot be empty"
        },
      }
    },
  }, {
    sequelize,
    modelName: 'Driver',
  });
  return Driver;
};
'use strict';
const bcrypt = require('bcrypt');
// const saltRounds = 10;
// const salt = bcrypt.genSaltSync(saltRounds); // gen seed
// const myPlaintextPassword = 's0/\/\P4$$w0rD'; // passworld contoh
// const hash = bcrypt.hashSync(myPlaintextPassword, saltRounds); // enc code
// bcrypt.compareSync(myPlaintextPassword, hash) // membandingkan code
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Account.belongsTo(models.Client)
      Account.belongsTo(models.Driver)
    }
    static enc(value){
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds)
      return bcrypt.hashSync(value, salt)
    }
    static checkPassword(value,hash){
      return bcrypt.compareSync(value, hash)
    }
  }
  Account.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: "Email is already in use"
      },
      validate: {
        notNull: {
          msg: "Email cannot be empty"
        },
        notEmpty: {
          msg: "Email cannot be empty"
        },
        isEmail: {
          args: true,
          msg: "Invalid email format"
        }
      }
    },    
    user: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "User cannot be empty"
        },
        notEmpty: {
          msg: "User cannot be empty"
        },
        isSymbolFree(value) {
          if (/[!@#$%^&*()_+{}\[\]:;<>,.?~\\]/.test(value)) {
            throw new Error("User cannot contain symbols");
          }
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Password cannot be empty"
        },
        notEmpty: {
          msg: "Password cannot be empty"
        },
        isLongEnough(value) {
          if (value.length < 8) {
            throw new Error("Password must be at least 8 characters long");
          }
        }
      }
    },    
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        notNull: {
          msg: "Role cannot be empty"
        },
        notEmpty: {
          msg: "Role cannot be empty"
        },
      }
    },
    ClientId: {
      type:DataTypes.INTEGER,
      validate:{
        checkingDriveId(value){
          if (!value){
            if (!this.DriverId){
              throw new Error("What option you choise?")
            }
          }
        }
      },
    },
    DriverId: {
      type:DataTypes.INTEGER,
      validate:{
        checkingClient(value){
          if (!value){
            if (!this.ClientId){
              throw new Error("What option you choise?")
            }
          }
        }
      },
    },
  }, {
    sequelize,
    modelName: 'Account',
  });
  return Account;
};
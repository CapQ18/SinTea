import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Drink extends Model {}

Drink.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shopId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  price: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  sweetness: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: { min: 0, max: 10 }
  },
  teaFlavor: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: { min: 0, max: 10 }
  },
  milkFlavor: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: { min: 0, max: 10 }
  },
  texture: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: { min: 0, max: 10 }
  },
  coldness: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: { min: 0, max: 10 }
  },
  appearance: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: { min: 0, max: 10 }
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Drink'
});

export default Drink;

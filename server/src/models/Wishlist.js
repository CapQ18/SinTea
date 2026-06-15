import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Wishlist extends Model {}

Wishlist.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  shopId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  drinkId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  drinkName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  drinkImage: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  status: {
    type: DataTypes.ENUM('wish', 'tried', 'favorite'),
    defaultValue: 'wish'
  },
  note: {
    type: DataTypes.STRING(200),
    defaultValue: ''
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0, max: 10 }
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
  modelName: 'Wishlist'
});

export default Wishlist;

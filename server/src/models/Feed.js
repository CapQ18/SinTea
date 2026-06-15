import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Feed extends Model {}

Feed.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  shopId: {
    type: DataTypes.UUID
  },
  drinkId: {
    type: DataTypes.UUID
  },
  sweetness: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  teaFlavor: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  milkFlavor: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  texture: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  coldness: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  appearance: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likes: {
    type: DataTypes.JSON,
    defaultValue: []
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
  modelName: 'Feed'
});

export default Feed;

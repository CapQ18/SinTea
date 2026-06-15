import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Chat extends Model {}

Chat.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  lastMessageContent: {
    type: DataTypes.TEXT
  },
  lastMessageSenderId: {
    type: DataTypes.UUID
  },
  lastMessageTimestamp: {
    type: DataTypes.DATE
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
  modelName: 'Chat'
});

export default Chat;

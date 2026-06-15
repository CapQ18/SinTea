import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

class User extends Model {
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const obj = { ...this.get() };
    delete obj.password;
    return obj;
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 20]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: '/uploads/default-avatar.png'
  },
  bio: {
    type: DataTypes.STRING(200),
    defaultValue: ''
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
  modelName: 'User',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

export default User;

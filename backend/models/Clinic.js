const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

const Clinic = sequelize.define(
  'Clinic',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subscriptionStatus: {
      type: DataTypes.ENUM('active', 'inactive', 'pending'),
      defaultValue: 'pending',
      field: 'subscription_status',
    },
    maxDoctors: {
      type: DataTypes.INTEGER,
      defaultValue: 4,
      field: 'max_doctors',
    },
    subscriptionStartedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'subscription_started_at',
    },
    subscriptionExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'subscription_expires_at',
    },
  },
  {
    tableName: 'clinics',
    underscored: true,
    timestamps: true,
  }
);

module.exports = Clinic;

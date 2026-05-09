const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Treatment = sequelize.define(
  'Treatment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'client_id',
      references: {
        model: 'clients',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    visitType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'visit_type',
    },
    treatmentType: {
      type: DataTypes.STRING(100),
      field: 'treatment_type',
    },
    description: {
      type: DataTypes.STRING(500),
    },
    notes: {
      type: DataTypes.STRING(1000),
    },
    doctor: {
      type: DataTypes.STRING(100),
      defaultValue: 'Dr. Karimova',
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    nextVisitDate: {
      type: DataTypes.DATEONLY,
      field: 'next_visit_date',
    },
    nextVisitNotes: {
      type: DataTypes.STRING(500),
      field: 'next_visit_notes',
    },
    images: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
      defaultValue: 'completed',
    },
    treatmentDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'treatment_date',
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'doctor_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'treatments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeUpdate: (treatment) => {
        treatment.updatedAt = new Date();
      },
    },
  },
);

module.exports = Treatment;

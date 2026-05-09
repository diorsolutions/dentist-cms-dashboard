const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define(
  'Client',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'last_name',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        is: /^\+998\d{9}$/,
      },
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      field: 'date_of_birth',
    },
    address: {
      type: DataTypes.STRING(200),
    },
    status: {
      type: DataTypes.ENUM('inTreatment', 'completed'),
      defaultValue: 'inTreatment',
    },
    initialTreatment: {
      type: DataTypes.STRING(100),
      field: 'initial_treatment',
    },
    notes: {
      type: DataTypes.STRING(500),
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    uploadedFiles: {
      type: DataTypes.JSONB,
      field: 'uploaded_files',
      defaultValue: { images: [], documents: [], videos: [] },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
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
    tableName: 'clients',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: (client) => {
        if (!client.uploadedFiles) {
          client.uploadedFiles = { images: [], documents: [], videos: [] };
        }
        // If Base64 images are provided, sync them to uploadedFiles for consistency
        if (client.images && Array.isArray(client.images) && client.images.length > 0) {
          const imageObjects = client.images.map(url => ({ url, comment: '' }));
          client.uploadedFiles = {
            ...client.uploadedFiles,
            images: [...client.uploadedFiles.images, ...imageObjects]
          };
        }
      },
      beforeUpdate: (client) => {
        if (!client.uploadedFiles) {
          client.uploadedFiles = { images: [], documents: [], videos: [] };
        }
      },
    },
  },
);

// Instance method to get full name
Client.prototype.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

// Instance method to get age
Client.prototype.getAge = function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Instance method to add images
Client.prototype.addImages = async function (imageFilenames) {
  if (!this.uploadedFiles) {
    this.uploadedFiles = { images: [], documents: [], videos: [] };
  }
  if (!this.uploadedFiles.images) {
    this.uploadedFiles.images = [];
  }

  const imageObjects = imageFilenames.map((img) => {
    if (typeof img === 'string') {
      return { url: img, comment: '' };
    }
    return img;
  });

  this.uploadedFiles.images.push(...imageObjects);

  if (!this.images) {
    this.images = [];
  }
  const stringUrls = imageFilenames.map((img) => (typeof img === 'string' ? img : img.url));
  this.images.push(...stringUrls);

  this.changed('uploadedFiles', true);
  this.changed('images', true);

  return this.save();
};

// Instance method to remove images
Client.prototype.removeImages = async function (imageFilenames) {
  if (this.uploadedFiles && this.uploadedFiles.images) {
    this.uploadedFiles.images = this.uploadedFiles.images.filter(
      (img) => !imageFilenames.includes(img.url || img)
    );
    this.changed('uploadedFiles', true);
  }

  if (this.images) {
    this.images = this.images.filter((img) => !imageFilenames.includes(img));
    this.changed('images', true);
  }

  return this.save();
};

// Instance method to get all images
Client.prototype.getAllImages = function () {
  const newImages = this.uploadedFiles?.images || [];
  const legacyImages = this.images || [];
  const allImages = [...new Set([...newImages, ...legacyImages])];
  return allImages;
};

module.exports = Client;

const User = require('./User');
const Client = require('./Client');
const Treatment = require('./Treatment');
const Clinic = require('./Clinic');

// User (Doctor) has many Clients
User.hasMany(Client, {
    foreignKey: 'doctorId',
    as: 'clients',
    onDelete: 'SET NULL',
});

// Client belongs to User (Doctor)
Client.belongsTo(User, {
    foreignKey: 'doctorId',
    as: 'doctorUser',
});

// Client has many Treatments
Client.hasMany(Treatment, {
    foreignKey: 'clientId',
    as: 'treatments',
    onDelete: 'CASCADE',
});

// Treatment belongs to Client
Treatment.belongsTo(Client, {
    foreignKey: 'clientId',
    as: 'client',
});

// User (Doctor) has many Treatments
User.hasMany(Treatment, {
    foreignKey: 'doctorId',
    as: 'treatments',
    onDelete: 'SET NULL',
});

// Treatment belongs to User (Doctor)
Treatment.belongsTo(User, {
    foreignKey: 'doctorId',
    as: 'doctorUser',
});

// Clinic Associations
Clinic.hasMany(User, { foreignKey: 'clinicId', as: 'doctors' });
User.belongsTo(Clinic, { foreignKey: 'clinicId', as: 'clinic' });

User.hasMany(User, { foreignKey: 'parentId', as: 'colleagues' });
User.belongsTo(User, { foreignKey: 'parentId', as: 'mainDoctor' });

module.exports = { User, Client, Treatment, Clinic };

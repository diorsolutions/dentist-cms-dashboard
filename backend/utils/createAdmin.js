const User = require('../models/User');
const { sequelize } = require('../config/database');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function createAdmin() {
  try {
    // Sync is not needed if tables exist, but let's just make sure connection is ok
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    const adminData = {
      username: 'admin',
      email: 'admin@dental.uz',
      password: 'adminpassword123',
      firstName: 'Olloyorov',
      lastName: 'Xursandbek',
      phone: '+998901234567',
      role: 'admin',
      isActive: true
    };

    // Check if user already exists
    const existing = await User.findOne({ where: { username: adminData.username } });
    if (existing) {
      console.log('User with username "admin" already exists. Updating details...');
      existing.role = 'admin';
      existing.isActive = true;
      existing.password = 'adminpassword123';
      existing.firstName = adminData.firstName;
      existing.lastName = adminData.lastName;
      existing.phone = adminData.phone;
      await existing.save();
      console.log('Admin details and password updated successfully.');
    } else {
      await User.create(adminData);
      console.log('Admin user created successfully!');
      console.log('Username: admin');
      console.log('Password: adminpassword123');
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await sequelize.close();
  }
}

createAdmin();

const { sequelize } = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Check if any admin exists
    const adminExists = await User.findOne({
      where: { role: 'admin' }
    });

    if (adminExists) {
      console.log('Admin already exists:', adminExists.username);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      email: 'admin@clinic.uz',
      password: 'admin123',
      phone: '+998901234567',
      role: 'admin',
      active: true
    });

    console.log('Admin created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Please change the password after first login.');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

seedAdmin();

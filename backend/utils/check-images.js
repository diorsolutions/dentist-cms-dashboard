const Client = require('../models/Client');
const { sequelize } = require('../config/database');

async function checkImages() {
  try {
    const clients = await Client.findAll();
    console.log(`Found ${clients.length} clients.`);
    clients.forEach(c => {
      console.log(`Client: ${c.firstName} ${c.lastName}`);
      console.log(`  images:`, c.images);
      console.log(`  uploadedFiles:`, JSON.stringify(c.uploadedFiles, null, 2));
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkImages();

const fs = require('fs');
const path = require('path');
const { sequelize } = require('./config/database');
const Client = require('./models/Client');

async function testUpload() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    // Find any active client
    const client = await Client.findOne({ where: { is_active: true } });
    if (!client) {
      console.log('No client found');
      return;
    }
    console.log('Using client:', client.id);

    // Simulate the upload logic
    const uploadsDir = path.join(__dirname, "public/uploads");
    const filename = `test_upload_${Date.now()}.txt`;
    const destPath = path.join(uploadsDir, filename);

    // Write a dummy file directly to uploads
    fs.writeFileSync(destPath, 'test file content');
    console.log('Created file at:', destPath);

    const imageObjects = [{ url: `uploads/${filename}`, comment: 'test' }];

    // Add to client
    await client.addImages(imageObjects);
    console.log('Added to client via addImages()');

    // Verify
    const updatedClient = await Client.findByPk(client.id);
    console.log('Updated client uploadedFiles.images:', JSON.stringify(updatedClient.uploadedFiles.images));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

testUpload();

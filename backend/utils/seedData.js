const { sequelize } = require("../config/database");
const { User, Client, Treatment } = require("../models/index");
require("dotenv").config();

const seedData = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL");

    // Sync tables
    await sequelize.sync({ force: true });
    console.log("🔄 Database tables synchronized");

    // Clear existing data
    await Treatment.destroy({ where: {} });
    await Client.destroy({ where: {} });
    await User.destroy({ where: {} });
    console.log("🧹 Cleared existing data");

    // Create admin user
    const adminUser = await User.create({
      username: "admin",
      email: "admin@dentalclinic.uz",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });

    // Create doctor user
    const doctorUser = await User.create({
      username: "doctor",
      email: "doctor@dentalclinic.uz",
      password: "doctor123",
      firstName: "Dr. Malika",
      lastName: "Karimova",
      role: "doctor",
    });

    console.log("👥 Created users");

    // Create sample clients
    const client1 = await Client.create({
      firstName: "Ahmadjon",
      lastName: "Karimov",
      phone: "+998901234567",
      email: "ahmad@example.com",
      dateOfBirth: "1989-01-15",
      address: "Toshkent, Yunusobod tumani",
      status: "inTreatment",
      initialTreatment: "Tish to'ldirish",
      notes: "Yuqori jag'da 3 ta tish davolash kerak",
    });

    const client2 = await Client.create({
      firstName: "Malika",
      lastName: "Toshmatova",
      phone: "+998907654321",
      email: "malika@example.com",
      dateOfBirth: "1996-05-20",
      address: "Toshkent, Mirzo Ulug'bek tumani",
      status: "completed",
      initialTreatment: "Tish tozalash",
      notes: "Muntazam profilaktik ko'rik",
    });

    const client3 = await Client.create({
      firstName: "Bobur",
      lastName: "Rahimov",
      phone: "+998909876543",
      email: "bobur@example.com",
      dateOfBirth: "1982-03-10",
      address: "Toshkent, Shayxontohur tumani",
      status: "inTreatment",
      initialTreatment: "Implant o'rnatish",
      notes: "Oldindan tayyorgarlik ko'rish kerak",
    });

    const client4 = await Client.create({
      firstName: "Nodira",
      lastName: "Abdullayeva",
      phone: "+998905555555",
      email: "nodira@example.com",
      dateOfBirth: "2000-08-25",
      address: "Toshkent, Chilonzor tumani",
      status: "inTreatment",
      initialTreatment: "Ortodontik davolash",
      notes: "Breket tizimi o'rnatilgan",
    });

    const client5 = await Client.create({
      firstName: "Jasur",
      lastName: "Aliyev",
      phone: "+998901111111",
      email: "jasur@example.com",
      dateOfBirth: "1994-12-01",
      address: "Toshkent, Sergeli tumani",
      status: "completed",
      initialTreatment: "Tish olib tashlash",
      notes: "Aql tishi olib tashlandi",
    });

    console.log("🦷 Created clients");

    // Create sample treatments
    await Treatment.bulkCreate([
      {
        clientId: client1.id,
        visitType: "Karies davolash",
        treatmentType: "Tish to'ldirish",
        description: "Yuqori jag'dagi tish to'ldirildi",
        notes: "Karies tozalandi, kompozit material bilan to'ldirildi. Bemor og'riq hissi yo'q deb bildirdi.",
        doctor: "Dr. Karimova",
        cost: 150000,
        status: "completed",
      },
      {
        clientId: client1.id,
        visitType: "Konsultatsiya",
        treatmentType: "Dastlabki ko'rik",
        description: "Og'iz bo'shlig'i tekshirildi",
        notes: "3 ta tishda karies aniqlandi. Davolash rejasi tuzildi.",
        doctor: "Dr. Karimova",
        cost: 50000,
        status: "completed",
      },
      {
        clientId: client2.id,
        visitType: "Profilaktika",
        treatmentType: "Tish tozalash",
        description: "Professional tish tozalash",
        notes: "Ultrasonic tozalash amalga oshirildi, tish toshi olib tashlandi, polishing qilindi.",
        doctor: "Dr. Abdullayev",
        cost: 100000,
        status: "completed",
      },
      {
        clientId: client3.id,
        visitType: "Implant tayyorgarlik",
        treatmentType: "Konsultatsiya va rentgen",
        description: "Implant o'rnatish uchun ko'rik",
        notes: "Rentgen surati olindi, suyak zichligi tekshirildi. Implant o'rnatish uchun mos.",
        doctor: "Dr. Karimova",
        cost: 200000,
        status: "completed",
      },
      {
        clientId: client4.id,
        visitType: "Ortodontiya",
        treatmentType: "Breket o'rnatish",
        description: "Metal breket tizimi o'rnatildi",
        notes: "Yuqori va pastki jag'ga metal breket o'rnatildi. Bemor og'iz gigienasi bo'yicha yo'riqnoma berildi.",
        doctor: "Dr. Ortiqova",
        cost: 2000000,
        status: "completed",
      },
    ]);

    console.log("💊 Created treatments");

    console.log(`
🎉 Seed data created successfully!

📋 Login credentials:
👤 Admin: username=admin, password=admin123
🩺 Doctor: username=doctor, password=doctor123

🔗 API Endpoints:
📍 Health Check: http://localhost:5000/api/health
📍 API Docs: http://localhost:5000/api
📍 Clients: http://localhost:5000/api/clients
📍 Treatments: http://localhost:5000/api/treatments
📍 Auth: http://localhost:5000/api/auth
📍 Upload: http://localhost:5000/api/upload

💡 Test commands:
curl http://localhost:5000/api/health
curl http://localhost:5000/api/clients
    `);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed data error:", error);
    process.exit(1);
  }
};

// Run seed data
seedData();

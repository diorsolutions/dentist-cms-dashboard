const mongoose = require("mongoose")
require("dotenv").config()

// Import models
const User = require("../models/User")
const Client = require("../models/Client")
const Treatment = require("../models/Treatment")

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Client.deleteMany({})
    await Treatment.deleteMany({})
    console.log("🧹 Cleared existing data")

    // Create admin user
    const adminUser = new User({
      username: "admin",
      email: "admin@dentalclinic.uz",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    })
    await adminUser.save()

    // Create doctor user
    const doctorUser = new User({
      username: "doctor",
      email: "doctor@dentalclinic.uz",
      password: "doctor123",
      firstName: "Dr. Malika",
      lastName: "Karimova",
      role: "doctor",
    })
    await doctorUser.save()

    console.log("👥 Created users")

    // Create sample clients
    const clients = [
      {
        firstName: "Ahmadjon",
        lastName: "Karimov",
        phone: "+998901234567",
        email: "ahmad@example.com",
        age: 35,
        address: "Toshkent, Yunusobod tumani",
        status: "inTreatment",
        initialTreatment: "Tish to'ldirish",
        notes: "Yuqori jag'da 3 ta tish davolash kerak",
      },
      {
        firstName: "Malika",
        lastName: "Toshmatova",
        phone: "+998907654321",
        email: "malika@example.com",
        age: 28,
        address: "Toshkent, Mirzo Ulug'bek tumani",
        status: "completed",
        initialTreatment: "Tish tozalash",
        notes: "Muntazam profilaktik ko'rik",
      },
      {
        firstName: "Bobur",
        lastName: "Rahimov",
        phone: "+998909876543",
        email: "bobur@example.com",
        age: 42,
        address: "Toshkent, Shayxontohur tumani",
        status: "inTreatment",
        initialTreatment: "Implant o'rnatish",
        notes: "Oldindan tayyorgarlik ko'rish kerak",
      },
      {
        firstName: "Nodira",
        lastName: "Abdullayeva",
        phone: "+998905555555",
        email: "nodira@example.com",
        age: 24,
        address: "Toshkent, Chilonzor tumani",
        status: "inTreatment",
        initialTreatment: "Ortodontik davolash",
        notes: "Breket tizimi o'rnatilgan",
      },
      {
        firstName: "Jasur",
        lastName: "Aliyev",
        phone: "+998901111111",
        email: "jasur@example.com",
        age: 30,
        address: "Toshkent, Sergeli tumani",
        status: "completed",
        initialTreatment: "Tish olib tashlash",
        notes: "Aql tishi olib tashlandi",
      },
    ]

    const createdClients = await Client.insertMany(clients)
    console.log("🦷 Created clients")

    // Create sample treatments
    const treatments = [
      {
        clientId: createdClients[0]._id,
        visitType: "Karies davolash",
        treatmentType: "Tish to'ldirish",
        description: "Yuqori jag'dagi tish to'ldirildi",
        notes: "Karies tozalandi, kompozit material bilan to'ldirildi. Bemor og'riq hissi yo'q deb bildirdi.",
        doctor: "Dr. Karimova",
        cost: 150000,
        status: "completed",
      },
      {
        clientId: createdClients[0]._id,
        visitType: "Konsultatsiya",
        treatmentType: "Dastlabki ko'rik",
        description: "Og'iz bo'shlig'i tekshirildi",
        notes: "3 ta tishda karies aniqlandi. Davolash rejasi tuzildi.",
        doctor: "Dr. Karimova",
        cost: 50000,
        status: "completed",
      },
      {
        clientId: createdClients[1]._id,
        visitType: "Profilaktika",
        treatmentType: "Tish tozalash",
        description: "Professional tish tozalash",
        notes: "Ultrasonic tozalash amalga oshirildi, tish toshi olib tashlandi, polishing qilindi.",
        doctor: "Dr. Abdullayev",
        cost: 100000,
        status: "completed",
      },
      {
        clientId: createdClients[2]._id,
        visitType: "Implant tayyorgarlik",
        treatmentType: "Konsultatsiya va rentgen",
        description: "Implant o'rnatish uchun ko'rik",
        notes: "Rentgen surati olindi, suyak zichligi tekshirildi. Implant o'rnatish uchun mos.",
        doctor: "Dr. Karimova",
        cost: 200000,
        status: "completed",
      },
      {
        clientId: createdClients[3]._id,
        visitType: "Ortodontiya",
        treatmentType: "Breket o'rnatish",
        description: "Metal breket tizimi o'rnatildi",
        notes: "Yuqori va pastki jag'ga metal breket o'rnatildi. Bemor og'iz gigienasi bo'yicha yo'riqnoma berildi.",
        doctor: "Dr. Ortiqova",
        cost: 2000000,
        status: "completed",
      },
    ]

    await Treatment.insertMany(treatments)
    console.log("💊 Created treatments")

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
    `)

    process.exit(0)
  } catch (error) {
    console.error("❌ Seed data error:", error)
    process.exit(1)
  }
}

// Run seed data
seedData()

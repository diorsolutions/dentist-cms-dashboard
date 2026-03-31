const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const createAdmin = async () => {
  try {
    // Manzilni tekshirib ulanamiz
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI topilmadi!");

    await mongoose.connect(uri);
    console.log("✅ Bazaga ulanish muvaffaqiyatli.");

    const username = "admin";
    const password = "admin123";

    // Agar avval bor bo'lsa o'chiramiz
    await User.findOneAndDelete({ username });
    console.log("🗑️ Eskisi o'chirildi.");

    // Yangi admin yaratamiz
    const user = new User({
      username,
      email: "admin@example.com",
      password: password, // Model ichida pre-save hook borligini hisobga olamiz
      firstName: "Admin",
      lastName: "System",
      role: "admin",
      isActive: true,
    });

    await user.save();

    console.log(`
🎉 Muvaffaqiyatli yaratildi!
-------------------------
👤 Username: ${username}
🔑 Password: ${password}
-------------------------
Endi bemalol kirishingiz mumkin!
    `);

    process.exit(0);
  } catch (error) {
    console.error("❌ Xatolik:", error);
    process.exit(1);
  }
};

createAdmin();

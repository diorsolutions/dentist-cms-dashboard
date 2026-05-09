/**
 * MongoDB to PostgreSQL Data Migration Script
 * 
 * This script migrates existing data from MongoDB to PostgreSQL.
 * 
 * Usage:
 * 1. Ensure both MongoDB and PostgreSQL are running
 * 2. Set MONGODB_URI and DATABASE_URL (or DB_*) in .env
 * 3. Run: node utils/migrate-mongo-to-pg.js
 */

const mongoose = require("mongoose");
const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// MongoDB connection
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

// PostgreSQL connection
const sequelize = new Sequelize(
    process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || "postgres"}:${process.env.DB_PASSWORD || ""}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || "dental_cms"}`,
    {
        dialect: "postgres",
        logging: console.log,
    }
);

const connectPostgreSQL = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Connected to PostgreSQL");
    } catch (error) {
        console.error("❌ PostgreSQL connection error:", error);
        process.exit(1);
    }
};

// Define Sequelize models for PostgreSQL
const PgUser = sequelize.define(
    "User",
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        username: { type: DataTypes.STRING(30), allowNull: false, unique: true },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
        firstName: { type: DataTypes.STRING(50), allowNull: false, field: "first_name" },
        lastName: { type: DataTypes.STRING(50), allowNull: false, field: "last_name" },
        role: { type: DataTypes.ENUM("admin", "doctor", "assistant"), defaultValue: "assistant" },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: "is_active" },
        lastLogin: { type: DataTypes.DATE, field: "last_login" },
    },
    { tableName: "users", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

const PgClient = sequelize.define(
    "Client",
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        firstName: { type: DataTypes.STRING(50), allowNull: false, field: "first_name" },
        lastName: { type: DataTypes.STRING(50), allowNull: false, field: "last_name" },
        phone: { type: DataTypes.STRING(20), allowNull: false },
        email: { type: DataTypes.STRING },
        dateOfBirth: { type: DataTypes.DATEONLY, field: "date_of_birth" },
        address: { type: DataTypes.STRING(200) },
        status: { type: DataTypes.ENUM("inTreatment", "completed"), defaultValue: "inTreatment" },
        initialTreatment: { type: DataTypes.STRING(100), field: "initial_treatment" },
        notes: { type: DataTypes.STRING(500) },
        images: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
        uploadedFiles: { type: DataTypes.JSONB, field: "uploaded_files", defaultValue: { images: [], documents: [], videos: [] } },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: "is_active" },
    },
    { tableName: "clients", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

const PgTreatment = sequelize.define(
    "Treatment",
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        clientId: { type: DataTypes.UUID, allowNull: false, field: "client_id" },
        visitType: { type: DataTypes.STRING(100), allowNull: false, field: "visit_type" },
        treatmentType: { type: DataTypes.STRING(100), field: "treatment_type" },
        description: { type: DataTypes.STRING(500) },
        notes: { type: DataTypes.STRING(1000) },
        doctor: { type: DataTypes.STRING(100), defaultValue: "Dr. Karimova" },
        cost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        nextVisitDate: { type: DataTypes.DATEONLY, field: "next_visit_date" },
        nextVisitNotes: { type: DataTypes.STRING(500), field: "next_visit_notes" },
        images: { type: DataTypes.JSONB, defaultValue: [] },
        status: { type: DataTypes.ENUM("scheduled", "completed", "cancelled"), defaultValue: "completed" },
        treatmentDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: "treatment_date" },
    },
    { tableName: "treatments", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

// MongoDB Models (using raw schema since we're reading from existing DB)
const MongoUser = mongoose.model("User", new mongoose.Schema({}, { strict: false }), "users");
const MongoClient = mongoose.model("Client", new mongoose.Schema({}, { strict: false }), "clients");
const MongoTreatment = mongoose.model("Treatment", new mongoose.Schema({}, { strict: false }), "treatments");

// Helper function to convert MongoDB ObjectId to string
const toString = (val) => (val ? val.toString() : val);

// Migration function
const migrate = async () => {
    console.log("🚀 Starting MongoDB to PostgreSQL migration...\n");

    // Connect to both databases
    await connectMongoDB();
    await connectPostgreSQL();

    // 1. Migrate Users
    console.log("\n📋 Migrating Users...");
    const mongoUsers = await MongoUser.find({});
    let userCount = 0;
    for (const user of mongoUsers) {
        try {
            await PgUser.create({
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                password: user.password, // Already hashed
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role || "assistant",
                isActive: user.isActive !== undefined ? user.isActive : true,
                lastLogin: user.lastLogin || null,
                createdAt: user.createdAt || new Date(),
                updatedAt: user.updatedAt || new Date(),
            });
            userCount++;
        } catch (error) {
            console.error(`  ⚠️  Error migrating user ${user.username}:`, error.message);
        }
    }
    console.log(`  ✅ Migrated ${userCount}/${mongoUsers.length} users`);

    // 2. Migrate Clients
    console.log("\n📋 Migrating Clients...");
    const mongoClients = await MongoClient.find({});
    let clientCount = 0;
    for (const client of mongoClients) {
        try {
            await PgClient.create({
                id: client._id.toString(),
                firstName: client.firstName,
                lastName: client.lastName,
                phone: client.phone,
                email: client.email || null,
                dateOfBirth: client.dateOfBirth || null,
                address: client.address || null,
                status: client.status || "inTreatment",
                initialTreatment: client.initialTreatment || null,
                notes: client.notes || null,
                images: client.images || [],
                uploadedFiles: client.uploadedFiles || { images: [], documents: [], videos: [] },
                isActive: client.isActive !== undefined ? client.isActive : true,
                createdAt: client.createdAt || new Date(),
                updatedAt: client.updatedAt || new Date(),
            });
            clientCount++;
        } catch (error) {
            console.error(`  ⚠️  Error migrating client ${client.firstName} ${client.lastName}:`, error.message);
        }
    }
    console.log(`  ✅ Migrated ${clientCount}/${mongoClients.length} clients`);

    // 3. Migrate Treatments
    console.log("\n📋 Migrating Treatments...");
    const mongoTreatments = await MongoTreatment.find({});
    let treatmentCount = 0;
    for (const treatment of mongoTreatments) {
        try {
            await PgTreatment.create({
                id: treatment._id.toString(),
                clientId: treatment.clientId ? treatment.clientId.toString() : null,
                visitType: treatment.visitType,
                treatmentType: treatment.treatmentType || null,
                description: treatment.description || null,
                notes: treatment.notes || null,
                doctor: treatment.doctor || "Dr. Karimova",
                cost: treatment.cost || 0,
                nextVisitDate: treatment.nextVisitDate || null,
                nextVisitNotes: treatment.nextVisitNotes || null,
                images: treatment.images || [],
                status: treatment.status || "completed",
                treatmentDate: treatment.treatmentDate || new Date(),
                createdAt: treatment.createdAt || new Date(),
                updatedAt: treatment.updatedAt || new Date(),
            });
            treatmentCount++;
        } catch (error) {
            console.error(`  ⚠️  Error migrating treatment ${treatment._id}:`, error.message);
        }
    }
    console.log(`  ✅ Migrated ${treatmentCount}/${mongoTreatments.length} treatments`);

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("🎉 Migration Complete!");
    console.log("=".repeat(50));
    console.log(`  Users: ${userCount}/${mongoUsers.length}`);
    console.log(`  Clients: ${clientCount}/${mongoClients.length}`);
    console.log(`  Treatments: ${treatmentCount}/${mongoTreatments.length}`);
    console.log("=".repeat(50));

    // Close connections
    await mongoose.connection.close();
    await sequelize.close();
    console.log("\n✅ Database connections closed");
    process.exit(0);
};

// Run migration
migrate().catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
});

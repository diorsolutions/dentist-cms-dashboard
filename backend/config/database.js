const { Sequelize } = require('sequelize');
require('dotenv').config();

// Support both DATABASE_URL and individual DB config variables
let sequelize;

if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    });
} else {
    sequelize = new Sequelize(
        process.env.DB_NAME || 'dental_cms',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASSWORD || '',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            logging: process.env.NODE_ENV === 'development' ? console.log : false,
            pool: {
                max: 10,
                min: 0,
                acquire: 30000,
                idle: 10000,
            },
        },
    );
}

// Test connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL Connected successfully');
        return true;
    } catch (error) {
        console.error('❌ PostgreSQL connection error:', error);
        return false;
    }
};

module.exports = { sequelize, testConnection };

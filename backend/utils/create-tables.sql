-- PostgreSQL Schema for Dental Clinic CMS
-- Run this script to create the database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) DEFAULT 'assistant' CHECK (role IN ('admin', 'doctor', 'assistant')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE,
    address VARCHAR(200),
    status VARCHAR(20) DEFAULT 'inTreatment' CHECK (status IN ('inTreatment', 'completed')),
    initial_treatment VARCHAR(100),
    notes VARCHAR(500),
    images TEXT[] DEFAULT '{}',
    uploaded_files JSONB DEFAULT '{"images": [], "documents": [], "videos": []}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_date_of_birth ON clients(date_of_birth);

-- Treatments table
CREATE TABLE IF NOT EXISTS treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    visit_type VARCHAR(100) NOT NULL,
    treatment_type VARCHAR(100),
    description VARCHAR(500),
    notes VARCHAR(1000),
    doctor VARCHAR(100) DEFAULT 'Dr. Karimova',
    cost NUMERIC(10, 2) DEFAULT 0 CHECK (cost >= 0),
    next_visit_date DATE,
    next_visit_notes VARCHAR(500),
    images JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    treatment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_treatments_client_id ON treatments(client_id);
CREATE INDEX IF NOT EXISTS idx_treatments_treatment_date ON treatments(treatment_date DESC);
CREATE INDEX IF NOT EXISTS idx_treatments_status ON treatments(status);
CREATE INDEX IF NOT EXISTS idx_treatments_doctor ON treatments(doctor);

-- Add foreign key constraint explicitly (if not already done via REFERENCES)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'treatments_client_id_fkey'
    ) THEN
        ALTER TABLE treatments
        ADD CONSTRAINT treatments_client_id_fkey
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
    END IF;
END $$;

# MongoDB to PostgreSQL Migration Plan

## Overview

This document outlines the complete migration plan from MongoDB to PostgreSQL for the Dental Clinic CMS backend. The migration involves converting Mongoose models to Sequelize ORM models, updating all route handlers, and providing a data migration script.

## Current MongoDB Structure

### Collections

1. **users** - Authentication and user management
2. **clients** - Patient/client information
3. **treatments** - Treatment records linked to clients

### Key MongoDB Features Used

- ObjectId references between collections
- Aggregation pipelines with `$lookup`
- Virtual fields (fullName, age, treatmentCount)
- Embedded arrays (images, uploadedFiles)
- Pre-save middleware (password hashing)
- Custom instance methods

## PostgreSQL Schema Design

### Table: users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Table: clients

```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE,
    address VARCHAR(200),
    status VARCHAR(20) DEFAULT 'inTreatment' CHECK (status IN ('inTreatment', 'completed')),
    initial_treatment VARCHAR(100),
    notes VARCHAR(500),
    images TEXT[], -- Legacy field: array of image URLs
    uploaded_files JSONB DEFAULT '{"images": [], "documents": [], "videos": []}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_name ON clients(first_name, last_name);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX idx_clients_date_of_birth ON clients(date_of_birth);
```

### Table: treatments

```sql
CREATE TABLE treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    visit_type VARCHAR(100) NOT NULL,
    treatment_type VARCHAR(100),
    description VARCHAR(500),
    notes VARCHAR(1000),
    doctor VARCHAR(100) DEFAULT 'Dr. Karimova',
    cost NUMERIC(10, 2) DEFAULT 0 CHECK (cost >= 0),
    next_visit_date DATE,
    next_visit_notes VARCHAR(500),
    images JSONB DEFAULT '[]', -- Array of {filename, url, cloudinaryId, comment, uploadedAt}
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    treatment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_treatments_client_id ON treatments(client_id);
CREATE INDEX idx_treatments_treatment_date ON treatments(treatment_date DESC);
CREATE INDEX idx_treatments_status ON treatments(status);
CREATE INDEX idx_treatments_doctor ON treatments(doctor);
```

## Architecture Diagram

```mermaid
graph TB
    subgraph Frontend
        A[Next.js App]
    end
    
    subgraph Backend
        B[Express Server]
        C[Auth Routes]
        D[Client Routes]
        E[Treatment Routes]
        F[Upload Routes]
        G[Auth Middleware]
        H[Validation Middleware]
    end
    
    subgraph Database Layer
        I[Sequelize ORM]
        J[User Model]
        K[Client Model]
        L[Treatment Model]
    end
    
    subgraph PostgreSQL
        M[users table]
        N[clients table]
        O[treatments table]
    end
    
    A --> B
    B --> C
    B --> D
    B --> E
    B --> F
    C --> G
    D --> G
    E --> G
    C --> H
    D --> H
    E --> H
    C --> I
    D --> I
    E --> I
    I --> J
    I --> K
    I --> L
    J --> M
    K --> N
    L --> O
```

## Key Migration Considerations

### 1. ObjectId to UUID

MongoDB uses ObjectId (24-char hex strings) while PostgreSQL will use UUID. All references need to be updated.

### 2. Embedded Documents

MongoDB embedded arrays (images, uploadedFiles) will be stored as:
- `images`: TEXT[] array for simple string URLs
- `uploadedFiles`: JSONB for complex nested structure
- `treatment.images`: JSONB for array of objects

### 3. Virtual Fields

MongoDB virtuals need to be implemented differently:
- `fullName`: Computed in SQL using `first_name || ' ' || last_name` or in application code
- `age`: Computed from `date_of_birth` in application code or SQL function
- `treatmentCount`: Use `COUNT()` query or include as a materialized column

### 4. Aggregation Pipelines

MongoDB aggregation pipelines with `$lookup` become SQL JOINs:

```javascript
// MongoDB
Client.aggregate([
  { $lookup: { from: 'treatments', localField: '_id', foreignField: 'clientId', as: 'treatments' } }
])

// PostgreSQL (Sequelize)
Client.findAll({
  include: [{ model: Treatment, as: 'treatments' }]
})
```

### 5. Password Hashing

The bcrypt pre-save hook in Mongoose becomes a Sequelize hook:

```javascript
// Sequelize hook
beforeSave: async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
}
```

## Implementation Steps

### Phase 1: Setup and Dependencies

1. Install new dependencies:
   - `sequelize` - ORM for PostgreSQL
   - `pg` - PostgreSQL driver
   - `pg-hstore` - HSTORE serializer/deserializer
   - `uuid` - UUID generation

2. Remove MongoDB dependencies:
   - `mongoose`

### Phase 2: Database Configuration

Create `backend/config/database.js`:
```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
```

### Phase 3: Model Conversion

Convert each Mongoose model to Sequelize:

#### User Model (`backend/models/User.js`)
- Schema fields map directly
- Use Sequelize hooks for password hashing
- Implement `comparePassword` as instance method
- UUID primary key

#### Client Model (`backend/models/Client.js`)
- Use JSONB for `uploadedFiles` nested structure
- Use TEXT[] for `images` array
- Add hooks for default values
- Implement `fullName` getter
- Define associations with Treatment

#### Treatment Model (`backend/models/Treatment.js`)
- Foreign key `client_id` references `clients.id`
- Use JSONB for `images` array of objects
- Define associations with Client

### Phase 4: Route Updates

#### Auth Routes (`backend/routes/auth.js`)
- Replace `User.findOne()` with Sequelize queries
- Replace `user._id` with `user.id`
- Update JWT payload to use `id` instead of `userId`

#### Client Routes (`backend/routes/clients.js`)
- Replace MongoDB aggregation with Sequelize `findAll` with `include`
- Replace `findById` with `findByPk`
- Replace `findByIdAndUpdate` with `update` on instance
- Replace `updateMany` with bulk `update`
- Handle complex search queries with Sequelize operators

#### Treatment Routes (`backend/routes/treatments.js`)
- Replace `find()` with `findAll()`
- Replace `findById()` with `findByPk()`
- Replace `findByIdAndUpdate()` with instance `update()`
- Replace `populate()` with `include`

### Phase 5: Middleware Updates

#### Auth Middleware (`backend/middleware/auth.js`)
- Replace `User.findById()` with Sequelize query
- Update `req.user` to use `id` instead of `userId`

### Phase 6: Server Updates

#### Server (`backend/server.js`)
- Replace MongoDB connection with Sequelize
- Update health check endpoint
- Add database sync/migration on startup

### Phase 7: Data Migration

Create migration script (`backend/utils/migrate-mongo-to-pg.js`):
1. Connect to both MongoDB and PostgreSQL
2. Migrate users first (no dependencies)
3. Migrate clients (no dependencies)
4. Migrate treatments (depends on clients)
5. Verify data integrity

## Environment Variables

Update `.env`:

```env
# Remove
MONGODB_URI=mongodb://...

# Add
DATABASE_URL=postgresql://username:password@localhost:5432/dental_cms
# Or separate fields:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dental_cms
DB_USER=postgres
DB_PASSWORD=your_password
```

## Sequelize Model Definitions

### User Model

```javascript
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255],
    },
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'first_name',
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'last_name',
  },
  role: {
    type: DataTypes.ENUM('admin', 'doctor', 'assistant'),
    defaultValue: 'assistant',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login',
  },
}, {
  tableName: 'users',
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

module.exports = User;
```

### Client Model

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'first_name',
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'last_name',
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      is: /^\+998\d{9}$/,
    },
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
    },
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    field: 'date_of_birth',
  },
  address: {
    type: DataTypes.STRING(200),
  },
  status: {
    type: DataTypes.ENUM('inTreatment', 'completed'),
    defaultValue: 'inTreatment',
  },
  initialTreatment: {
    type: DataTypes.STRING(100),
    field: 'initial_treatment',
  },
  notes: {
    type: DataTypes.STRING(500),
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [],
  },
  uploadedFiles: {
    type: DataTypes.JSONB,
    field: 'uploaded_files',
    defaultValue: { images: [], documents: [], videos: [] },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  tableName: 'clients',
  hooks: {
    beforeCreate: (client) => {
      if (!client.uploadedFiles) {
        client.uploadedFiles = { images: [], documents: [], videos: [] };
      }
    },
  },
});

Client.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

Client.prototype.getAge = function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

Client.prototype.addImages = async function(imageFilenames) {
  if (!this.uploadedFiles) {
    this.uploadedFiles = { images: [], documents: [], videos: [] };
  }
  if (!this.uploadedFiles.images) {
    this.uploadedFiles.images = [];
  }

  const imageObjects = imageFilenames.map((img) => {
    if (typeof img === 'string') {
      return { url: img, comment: '' };
    }
    return img;
  });

  this.uploadedFiles.images.push(...imageObjects);

  if (!this.images) {
    this.images = [];
  }
  const stringUrls = imageFilenames.map((img) => (typeof img === 'string' ? img : img.url));
  this.images.push(...stringUrls);

  return this.save();
};

module.exports = Client;
```

### Treatment Model

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Treatment = sequelize.define('Treatment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'client_id',
    references: {
      model: 'clients',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  visitType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'visit_type',
  },
  treatmentType: {
    type: DataTypes.STRING(100),
    field: 'treatment_type',
  },
  description: {
    type: DataTypes.STRING(500),
  },
  notes: {
    type: DataTypes.STRING(1000),
  },
  doctor: {
    type: DataTypes.STRING(100),
    defaultValue: 'Dr. Karimova',
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  nextVisitDate: {
    type: DataTypes.DATEONLY,
    field: 'next_visit_date',
  },
  nextVisitNotes: {
    type: DataTypes.STRING(500),
    field: 'next_visit_notes',
  },
  images: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
    defaultValue: 'completed',
  },
  treatmentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'treatment_date',
  },
}, {
  tableName: 'treatments',
  hooks: {
    beforeUpdate: (treatment) => {
      treatment.updatedAt = new Date();
    },
  },
});

module.exports = Treatment;
```

### Model Associations

```javascript
// backend/models/index.js
const User = require('./User');
const Client = require('./Client');
const Treatment = require('./Treatment');

// Client has many Treatments
Client.hasMany(Treatment, {
  foreignKey: 'clientId',
  as: 'treatments',
  onDelete: 'CASCADE',
});

// Treatment belongs to Client
Treatment.belongsTo(Client, {
  foreignKey: 'clientId',
  as: 'client',
});

module.exports = { User, Client, Treatment };
```

## Complex Query Migrations

### Get Clients with Pagination and Search

The MongoDB aggregation pipeline in `clients.js` route needs to be converted to Sequelize:

```javascript
// Original MongoDB aggregation becomes Sequelize query with include
const clients = await Client.findAll({
  where: {
    isActive: true,
    ...(status !== 'all' && { status }),
    ...(search && buildSearchFilter(searchField, search)),
  },
  include: [{
    model: Treatment,
    as: 'treatments',
    required: false,
  }],
  order: [[sortBy, sortOrder === 'desc' ? 'DESC' : 'ASC']],
  limit: limitNum,
  offset: skip,
  subQuery: false,
});
```

### Computing Virtual Fields

For `treatmentCount`, `lastVisit`, and `nextAppointment`:

```javascript
// Option 1: Compute after query
const clientsWithVirtuals = clients.map(client => {
  const clientObj = client.toJSON();
  clientObj.treatmentCount = client.treatments?.length || 0;
  clientObj.lastVisit = client.treatments?.length 
    ? Math.max(...client.treatments.map(t => new Date(t.treatmentDate)))
    : null;
  clientObj.nextAppointment = client.treatments?.length
    ? Math.min(...client.treatments
        .filter(t => t.nextVisitDate && new Date(t.nextVisitDate) >= new Date())
        .map(t => new Date(t.nextVisitDate)))
    : null;
  return clientObj;
});

// Option 2: Use raw SQL query with computed columns
const { QueryTypes } = require('sequelize');
const result = await sequelize.query(`
  SELECT c.*, 
         COUNT(t.id) as treatment_count,
         MAX(t.treatment_date) as last_visit,
         MIN(CASE WHEN t.next_visit_date >= NOW() THEN t.next_visit_date END) as next_appointment
  FROM clients c
  LEFT JOIN treatments t ON c.id = t.client_id
  WHERE c.is_active = true
  GROUP BY c.id
  ORDER BY ...
  LIMIT ... OFFSET ...
`, { type: QueryTypes.SELECT });
```

## Data Migration Script

```javascript
// backend/utils/migrate-mongo-to-pg.js
const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// MongoDB Models
const MongoClient = mongoose.model('Client', new mongoose.Schema({}, { strict: false }));
const MongoTreatment = mongoose.model('Treatment', new mongoose.Schema({}, { strict: false }));
const MongoUser = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

// Sequelize Models
const sequelize = new Sequelize(process.env.DATABASE_URL);
const PgClient = sequelize.define('Client', { /* schema */ }, { tableName: 'clients', timestamps: false });
const PgTreatment = sequelize.define('Treatment', { /* schema */ }, { tableName: 'treatments', timestamps: false });
const PgUser = sequelize.define('User', { /* schema */ }, { tableName: 'users', timestamps: false });

async function migrate() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Sync PostgreSQL (create tables if not exist)
  await sequelize.authenticate();
  console.log('Connected to PostgreSQL');

  // Migrate Users
  const mongoUsers = await MongoUser.find({});
  for (const user of mongoUsers) {
    await PgUser.create({
      id: user._id.toString(), // Keep same ID for reference
      username: user.username,
      email: user.email,
      password: user.password, // Already hashed
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
  console.log(`Migrated ${mongoUsers.length} users`);

  // Migrate Clients
  const mongoClients = await MongoClient.find({});
  for (const client of mongoClients) {
    await PgClient.create({
      id: client._id.toString(),
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
      email: client.email,
      dateOfBirth: client.dateOfBirth,
      address: client.address,
      status: client.status,
      initialTreatment: client.initialTreatment,
      notes: client.notes,
      images: client.images || [],
      uploadedFiles: client.uploadedFiles || { images: [], documents: [], videos: [] },
      isActive: client.isActive,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    });
  }
  console.log(`Migrated ${mongoClients.length} clients`);

  // Migrate Treatments
  const mongoTreatments = await MongoTreatment.find({});
  for (const treatment of mongoTreatments) {
    await PgTreatment.create({
      id: treatment._id.toString(),
      clientId: treatment.clientId.toString(),
      visitType: treatment.visitType,
      treatmentType: treatment.treatmentType,
      description: treatment.description,
      notes: treatment.notes,
      doctor: treatment.doctor,
      cost: treatment.cost,
      nextVisitDate: treatment.nextVisitDate,
      nextVisitNotes: treatment.nextVisitNotes,
      images: treatment.images || [],
      status: treatment.status,
      treatmentDate: treatment.treatmentDate,
      createdAt: treatment.createdAt,
      updatedAt: treatment.updatedAt,
    });
  }
  console.log(`Migrated ${mongoTreatments.length} treatments`);

  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch(console.error);
```

## Testing Checklist

After migration, verify:

1. [ ] User registration works
2. [ ] User login works
3. [ ] JWT authentication works
4. [ ] Create client works
5. [ ] Get all clients with pagination works
6. [ ] Search clients by name, phone, date works
7. [ ] Update client works
8. [ ] Delete client (soft delete) works
9. [ ] Bulk status update works
10. [ ] Bulk delete works
11. [ ] Export client as ZIP works
12. [ ] Create treatment works
13. [ ] Get client treatments works
14. [ ] Update treatment works
15. [ ] Delete treatment works
16. [ ] File upload works
17. [ ] All date filtering works correctly
18. [ ] Age calculation is correct
19. [ ] Treatment count is correct

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// Import database
const db = require('./config/database');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database schema
const initializeDatabase = async () => {
  try {
    const isPostgres = !!process.env.RDS_HOSTNAME;
    const schemaFile = isPostgres ? 'schema_pg.sql' : 'schema.sql';
    const schemaPath = path.join(__dirname, schemaFile);
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log(`Initializing database using ${schemaFile}...`);

    if (isPostgres) {
      // For PostgreSQL, we can use the pool.query() to execute the whole schema string
      await db.query(schema);
      console.log('PostgreSQL database initialized successfully');
    } else {
      // For SQLite
      return new Promise((resolve, reject) => {
        db.exec(schema, (err) => {
          if (err) {
            console.error('SQLite initialization error:', err);
            reject(err);
          } else {
            console.log('SQLite database initialized successfully');
            resolve();
          }
        });
      });
    }
  } catch (error) {
    console.error('Error during database initialization:', error);
    // Don't exit if it's already initialized or something minor
    // process.exit(1); 
  }
};

// Initialize database on server start
initializeDatabase();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const profileRoutes = require('./routes/profile');
const communityRoutes = require('./routes/community');
const interviewRoutes = require('./routes/interview');
const awsRoutes = require('./routes/aws');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/aws', awsRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  let db_status = 'Disconnected';
  let db_error = null;
  let users_table_exists = false;

  try {
    if (process.env.RDS_HOSTNAME) {
      await db.query('SELECT 1');
      db_status = 'Connected (PostgreSQL)';
      // Correction: PostgreSQL query for table existence
      const checkTable = await db.query("SELECT 1 FROM information_schema.tables WHERE table_name = 'users'");
      users_table_exists = checkTable.rowCount > 0;
    } else {
      await new Promise((resolve, reject) => {
        db.get('SELECT 1', (err) => (err ? reject(err) : resolve()));
      });
      db_status = 'Connected (SQLite)';
      const checkTable = await new Promise((resolve) => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => resolve(!!row));
      });
      users_table_exists = checkTable;
    }
  } catch (err) {
    db_status = 'Error';
    db_error = err.message;
    console.error('Health Check DB Error:', err);
  }

  res.json({
    status: 'Server is running',
    database: db_status,
    db_error: db_error,
    users_table_ready: users_table_exists,
    environment: process.env.NODE_ENV || 'production',
    google_keys: {
      client_id: !!process.env.GOOGLE_CLIENT_ID,
      client_secret: !!process.env.GOOGLE_CLIENT_SECRET
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database Mode: ${process.env.RDS_HOSTNAME ? 'RDS PostgreSQL' : 'Local SQLite'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Closing database connection...');
  if (process.env.RDS_HOSTNAME) {
    db.end().then(() => {
      console.log('PostgreSQL connection pool closed');
      process.exit(0);
    }).catch(err => {
      console.error('Error closing Postgres pool:', err);
      process.exit(1);
    });
  } else {
    db.close((err) => {
      if (err) {
        console.error('Error closing SQLite database:', err);
        process.exit(1);
      } else {
        console.log('SQLite database connection closed');
        process.exit(0);
      }
    });
  }
});

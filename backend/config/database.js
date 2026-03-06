const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

let db;

if (process.env.RDS_HOSTNAME) {
  // Use PostgreSQL for RDS
  console.log('Using PostgreSQL for RDS');
  db = new Pool({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB_NAME || 'postgres',
    port: process.env.RDS_PORT || 5432,
    ssl: {
      rejectUnauthorized: false // Required for AWS RDS in many cases
    }
  });

  // Add compatibility helpers to match SQLite API for minimal code changes elsewhere
  db.run = async (sql, params = [], callback) => {
    try {
      // Replace SQLite ? placeholders with PostgreSQL $1, $2, etc.
      let pgSql = sql;
      let i = 1;
      while (pgSql.includes('?')) {
        pgSql = pgSql.replace('?', `$${i++}`);
      }

      const result = await db.query(pgSql, params);
      if (callback) callback.call(result, null);
      return result;
    } catch (err) {
      if (callback) callback(err);
      throw err;
    }
  };

  db.get = async (sql, params = [], callback) => {
    try {
      let pgSql = sql;
      let i = 1;
      while (pgSql.includes('?')) {
        pgSql = pgSql.replace('?', `$${i++}`);
      }

      const result = await db.query(pgSql, params);
      if (callback) callback(null, result.rows[0]);
      return result.rows[0];
    } catch (err) {
      if (callback) callback(err);
      throw err;
    }
  };

  db.all = async (sql, params = [], callback) => {
    try {
      let pgSql = sql;
      let i = 1;
      while (pgSql.includes('?')) {
        pgSql = pgSql.replace('?', `$${i++}`);
      }

      const result = await db.query(pgSql, params);
      if (callback) callback(null, result.rows);
      return result.rows;
    } catch (err) {
      if (callback) callback(err);
      throw err;
    }
  };

  db.exec = async (sql, callback) => {
    try {
      // PostgreSQL doesn't support executing multiple statements at once easily like SQLite's exec()
      // But passing the whole schema to db.query() might work for some formats, or we split it.
      await db.query(sql);
      if (callback) callback(null);
    } catch (err) {
      if (callback) callback(err);
      throw err;
    }
  };

  console.log('PostgreSQL connection pool initialized');
} else {
  // Fallback to SQLite
  const dbPath = path.join(__dirname, '../nucareer.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening SQLite database', err);
    } else {
      console.log('Connected to SQLite database at', dbPath);
      // Enable foreign keys only for SQLite
      db.run('PRAGMA foreign_keys = ON');
    }
  });
}

module.exports = db;

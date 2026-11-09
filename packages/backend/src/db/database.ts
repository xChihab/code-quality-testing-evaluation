import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

import initDatabase from './migrations/init';

const { Database } = sqlite3.verbose();

let db: sqlite3.Database | null = null;

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');

export const connect = async (): Promise<sqlite3.Database> => {
  if (db) {
    return db;
  }

  return new Promise((resolve, reject) => {
    try {
      if (fs.existsSync(DB_PATH)) {
        const stats = fs.statSync(DB_PATH);
        console.log('Database file size:', stats.size, 'bytes');

        const files = fs.readdirSync(__dirname);
        console.log('Files in db directory:', files.length);
      }

      const instance = new Database(DB_PATH, async (err) => {
        if (err) {
          console.error('Error connecting to database:', err);
          reject(err);
          return;
        }

        console.log('Connected to SQLite database');

        try {
          await initDatabase(instance);
          console.log('Database initialized');
          resolve(instance);
        } catch (initErr) {
          console.error('Error initializing database:', initErr);
          reject(initErr);
        }
      });
      db = instance;
    } catch (err) {
      console.error('Failed to create database connection:', err);
      reject(err);
    }
  });
};

// Get database instance - throws error if not connected
export const getDb = (): sqlite3.Database => {
  if (!db) {
    throw new Error('Database not connected. Call connect() first.');
  }
  return db;
};

export const closeConnection = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve();
      return;
    }

    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
        reject(err);
        return;
      }
      db = null;
      resolve();
    });
  });
};

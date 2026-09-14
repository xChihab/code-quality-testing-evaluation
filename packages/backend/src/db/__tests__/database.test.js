const db = require('../database');

describe('Database Module', () => {
  afterEach(async () => {
    await db.closeConnection();
  });

  test('connect() establishes database connection and initializes tables', async () => {
    const instance = await db.connect();
    expect(instance).toBeDefined();
    
    // Calling connect again returns the same instance
    const secondCall = await db.connect();
    expect(secondCall).toBe(instance);
  });

  test('getDb() returns the database instance when connected', async () => {
    await db.connect();
    const instance = db.getDb();
    expect(instance).toBeDefined();
  });

  test('getDb() throws error if database is not connected', async () => {
    await db.closeConnection();
    expect(() => db.getDb()).toThrow('Database not connected. Call connect() first.');
  });

  test('closeConnection() safely closes connection', async () => {
    await db.connect();
    await expect(db.closeConnection()).resolves.toBeUndefined();
    expect(() => db.getDb()).toThrow('Database not connected. Call connect() first.');
    // Repeated closeConnection call resolves safely
    await expect(db.closeConnection()).resolves.toBeUndefined();
  });
});

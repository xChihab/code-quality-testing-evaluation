const { randomUUID } = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const testDatabasePath = path.join(os.tmpdir(), `quality-tests-${process.pid}-${randomUUID()}.sqlite`);
process.env.DB_PATH = testDatabasePath;

afterAll(() => {
  for (const suffix of ['', '-shm', '-wal']) {
    try {
      fs.unlinkSync(`${testDatabasePath}${suffix}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
});

import { randomUUID } from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

const testDatabasePath = path.join(os.tmpdir(), `quality-tests-${process.pid}-${randomUUID()}.sqlite`);
process.env.DB_PATH = testDatabasePath;

afterAll(() => {
  for (const suffix of ['', '-shm', '-wal']) {
    try {
      fs.unlinkSync(`${testDatabasePath}${suffix}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
});

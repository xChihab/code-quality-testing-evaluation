module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 60,
      functions: 70,
      lines: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/testSetup.ts'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts']
};

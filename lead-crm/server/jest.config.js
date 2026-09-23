module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTestDb.js'],
  testTimeout: 30000,
};

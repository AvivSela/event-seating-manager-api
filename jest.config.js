module.exports = {
  // Enable parallel test execution
  maxWorkers: '50%',
  
  // Improve test isolation
  isolatedModules: true,
  
  // Only run tests in __tests__ directories
  testMatch: ['**/__tests__/**/*.test.ts'],
  
  // Optimize transform caching
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      isolatedModules: true,
      diagnostics: false
    }]
  },
  
  // Cache babel transformations
  cache: true,
  
  // Optimize coverage collection
  collectCoverage: false,
  
  // Setup test environment
  testEnvironment: 'node',
  
  // Optimize module resolution
  moduleDirectories: ['node_modules', 'src'],
  
  // Setup timeout
  testTimeout: 10000,
  
  // Global setup file
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts']
}; 
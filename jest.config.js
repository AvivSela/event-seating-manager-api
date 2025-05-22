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
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{js,ts}',
    '!src/__tests__/**/*',
    '!**/node_modules/**'
  ],
  
  // Setup test environment
  testEnvironment: 'node',
  
  // Optimize module resolution
  moduleDirectories: ['node_modules', 'src'],
  
  // Setup timeout
  testTimeout: 10000,
  
  // Global setup file
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts']
}; 
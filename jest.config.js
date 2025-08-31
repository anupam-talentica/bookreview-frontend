// Jest configuration for BookReview frontend
module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Module name mapping for CSS and static assets
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
  },

  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['react-app'] }],
  },

  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
    '!src/setupTests.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>/src'],

  // File extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
  ],

  // Transform ignore patterns
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],

  // Reset mocks between tests
  resetMocks: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Verbose output
  verbose: false,

  // Test timeout
  testTimeout: 10000,

  // Max workers for parallel execution
  maxWorkers: '50%',

  // Error on deprecated features
  errorOnDeprecated: true,

  // Notify mode (for watch mode)
  notify: false,

  // Bail on first test failure (useful for CI)
  bail: process.env.CI ? 1 : 0,

  // Cache directory
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',

  // Global setup/teardown
  // globalSetup: '<rootDir>/src/__tests__/setup/globalSetup.js',
  // globalTeardown: '<rootDir>/src/__tests__/setup/globalTeardown.js',

  // Custom reporters
  reporters: [
    'default',
    ...(process.env.CI
      ? [
          [
            'jest-junit',
            {
              outputDirectory: 'test-results',
              outputName: 'junit.xml',
            },
          ],
        ]
      : []),
  ],

  // Snapshot serializers
  snapshotSerializers: ['@emotion/jest/serializer'],
};

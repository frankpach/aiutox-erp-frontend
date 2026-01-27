/** @type {import('jest').Config} */
module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/app/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/app/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/*.stories.{js,jsx,ts,tsx}',
    '!app/**/__tests__/**',
    '!app/**/index.{js,jsx,ts,tsx}',
    '!app/**/*.config.{js,jsx,ts,tsx}',
    '!app/main.tsx',
    '!app/vite-env.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
    'clover',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Higher threshold for critical components
    'app/components/tasks/**/*.{js,jsx,ts,tsx}': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Lower threshold for complex services
    'app/services/**/*.{js,jsx,ts,tsx}': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  
  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/app/$1',
    '^@assets/(.*)$': '<rootDir>/public/assets/$1',
    '^@components/(.*)$': '<rootDir>/app/components/$1',
    '^@pages/(.*)$': '<rootDir>/app/pages/$1',
    '^@services/(.*)$': '<rootDir>/app/services/$1',
    '^@utils/(.*)$': '<rootDir>/app/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/app/hooks/$1',
    '^@types/(.*)$': '<rootDir>/app/types/$1',
    '^@store/(.*)$': '<rootDir>/app/store/$1',
    '^@styles/(.*)$': '<rootDir>/app/styles/$1',
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript',
      ],
      plugins: [
        '@babel/plugin-transform-runtime',
        ['@babel/plugin-transform-modules-commonjs', { strict: true }],
      ],
    }],
    '^.+\\.(css|scss|sass|less)$': 'jest-transform-css',
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': 'jest-transform-stub',
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
    '<rootDir>/e2e/',
  ],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(axios|react-router-dom|@tanstack/react-query|date-fns|react-hook-form)/)',
  ],
  
  // Mock patterns
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  
  // Clear mocks
  clearMocks: true,
  
  // Restore mocks
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Test timeout
  testTimeout: 10000,
  
  // Max workers
  maxWorkers: '50%',
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Error handling
  errorOnDeprecated: true,
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // Global setup and teardown
  globalSetup: '<rootDir>/jest.global-setup.js',
  globalTeardown: '<rootDir>/jest.global-teardown.js',
  
  // Reporter configuration
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/html-report',
        filename: 'report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'Test Report',
        logoImgPath: undefined,
        inlineSource: false,
      },
    ],
  ],
  
  // Test results processor
  testResultsProcessor: undefined,
  
  // Snapshot configuration
  snapshotSerializers: ['@emotion/jest/serializer'],
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    resources: 'usable',
    runScripts: 'dangerously',
  },
  
  // Projects configuration for different test types
  projects: [
    // Unit tests
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/app/**/__tests__/**/*.unit.{test,spec}.{js,jsx,ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    },
    // Integration tests
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/app/**/__tests__/**/*.integration.{test,spec}.{js,jsx,ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/src/setupIntegrationTests.ts'],
      testTimeout: 30000,
    },
    // Component tests
    {
      displayName: 'components',
      testMatch: ['<rootDir>/app/components/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/src/setupComponentTests.ts'],
      testEnvironment: 'jsdom',
    },
  ],
};

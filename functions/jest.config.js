module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/__tests__/**'],
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        isolatedModules: true,
        module: 'NodeNext',
        moduleResolution: 'nodenext',
        types: ['jest', 'node'],
      },
      diagnostics: {
        ignoreCodes: [151002],
      },
    },
  },
};

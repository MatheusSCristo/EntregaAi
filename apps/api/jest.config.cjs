module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  roots: ['<rootDir>/src'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': '<rootDir>/jest.transformer.cjs',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};

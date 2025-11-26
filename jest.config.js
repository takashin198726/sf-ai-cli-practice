const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

module.exports = {
  ...jestConfig,
  moduleNameMapper: {
    '^c/(.+)$': '<rootDir>/force-app/main/default/lwc/$1/$1'
  },
  modulePathIgnorePatterns: [
    '<rootDir>/ws-claude',
    '<rootDir>/ws-codex',
    '<rootDir>/ws-gemini',
    '<rootDir>/ws-main',
    '<rootDir>/submodules',
    '<rootDir>/playwright'
  ]
};

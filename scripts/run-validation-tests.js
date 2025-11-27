#!/usr/bin/env node
/**
 * Test runner for validation tests
 * Runs Jest tests for metadata, schema, and configuration validation
 */

const { execSync } = require('child_process');
const path = require('path');

const testFiles = [
  'scripts/tests/validation/metadata.test.js',
  'scripts/tests/validation/schema.test.js',
  'scripts/tests/validation/tbls-config.test.js',
  'scripts/tests/validation/schema-docs.test.js',
  'scripts/tests/validation/integration.test.js'
];

console.log('Running validation tests...\n');

try {
  testFiles.forEach(testFile => {
    const absolutePath = path.join(__dirname, '..', testFile);
    console.log(`\nRunning: ${testFile}`);
    console.log('='.repeat(60));
    
    execSync(`npx jest "${absolutePath}" --verbose --colors`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All validation tests passed!');
  console.log('='.repeat(60));
} catch (error) {
  console.error('\n' + '='.repeat(60));
  console.error('❌ Validation tests failed!');
  console.error('='.repeat(60));
  process.exit(1);
}
# Validation Tests

This directory contains comprehensive validation tests for Salesforce metadata, schema documentation, and configuration files.

## Test Files

### 1. `metadata.test.js`
Validates Salesforce metadata XML files:
- **Account.object-meta.xml**: Tests object metadata structure, XML validity, required fields, search layouts, sharing models, and naming conventions
- **Name.field-meta.xml**: Tests field metadata structure, XML validity, and configuration

**Coverage:**
- XML structure and syntax validation
- Required Salesforce metadata elements
- Action overrides and layouts
- Sharing and security settings
- Search and lookup configurations
- File naming conventions
- Tag balance and proper nesting

### 2. `schema.test.js`
Validates the generated schema documentation JSON file:
- **schema.json**: Tests schema structure, table definitions, columns, indexes, and constraints

**Coverage:**
- JSON validity and structure
- Driver information
- Table metadata completeness
- Column definitions and properties
- Index definitions
- Constraint definitions
- Data consistency across schema elements
- Edge cases (special characters, formatting)

### 3. `tbls-config.test.js`
Validates the tbls (database documentation tool) configuration:
- **.tbls.yml**: Tests YAML configuration structure and settings

**Coverage:**
- YAML syntax and format validation
- DSN configuration
- Documentation path settings
- Format options (adjust, sort)
- ER diagram configuration (format, skip)
- Security checks (no hardcoded credentials)
- Best practices (indentation, naming conventions)

### 4. `schema-docs.test.js`
Validates the generated markdown documentation:
- **README.md**: Tests main schema documentation index
- **Account.md**: Tests detailed Account table documentation

**Coverage:**
- Markdown structure and formatting
- Required sections (Description, Columns, Constraints, Indexes, Relations)
- Table formatting and alignment
- Mermaid ER diagram syntax
- Content consistency with schema.json
- Link validation
- Quality checks (trailing spaces, line endings)

## Running Tests

### Run All Validation Tests
```bash
npm run test:validation
```

Or using the test runner directly:
```bash
node scripts/run-validation-tests.js
```

### Run Individual Test Files
```bash
# Metadata validation
npx jest scripts/tests/validation/metadata.test.js

# Schema JSON validation
npx jest scripts/tests/validation/schema.test.js

# tbls config validation
npx jest scripts/tests/validation/tbls-config.test.js

# Schema docs validation
npx jest scripts/tests/validation/schema-docs.test.js
```

### Run Tests in Watch Mode
```bash
npx jest scripts/tests/validation --watch
```

### Run Tests with Coverage
```bash
npx jest scripts/tests/validation --coverage
```

## Test Philosophy

These validation tests follow a comprehensive approach:

1. **Structural Validation**: Ensure files have correct structure and format
2. **Content Validation**: Verify all required elements are present
3. **Consistency Validation**: Check relationships between related files
4. **Quality Validation**: Enforce best practices and conventions
5. **Security Validation**: Detect potential security issues
6. **Edge Case Validation**: Handle special characters, formatting, etc.

## What These Tests Catch

- **XML Issues**: Malformed tags, missing required elements, invalid structure
- **JSON Issues**: Invalid JSON, missing properties, type mismatches
- **YAML Issues**: Syntax errors, invalid indentation, missing configurations
- **Markdown Issues**: Broken links, improper formatting, missing sections
- **Consistency Issues**: Mismatches between schema.json and markdown docs
- **Security Issues**: Hardcoded credentials, sensitive information
- **Quality Issues**: Trailing whitespace, inconsistent formatting

## Adding New Tests

When adding new Salesforce objects or metadata:

1. Add corresponding XML validation tests in `metadata.test.js`
2. Update `schema.test.js` to validate new table entries
3. Add markdown validation tests in `schema-docs.test.js`
4. Ensure consistency checks cover new elements

## Integration with CI/CD

These tests are designed to be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Validation Tests
  run: npm run test:validation
```

## Dependencies

- **Jest**: Test framework
- **Node.js**: Runtime for tests
- **fs/path**: File system operations

No additional dependencies are required - tests use only Node.js built-in modules.

## Maintenance

These tests should be updated when:
- New Salesforce objects are added
- Metadata structure changes
- Schema documentation format changes
- tbls configuration options change
- New validation requirements are identified
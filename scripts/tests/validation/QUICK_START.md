# Validation Tests Quick Start Guide

## TL;DR

```bash
# Run all validation tests
npm run test:validation

# Run specific test file
npx jest scripts/tests/validation/metadata.test.js
```

## What Gets Tested

| File | Test File | What It Validates |
|------|-----------|-------------------|
| `Account.object-meta.xml` | `metadata.test.js` | XML structure, Salesforce metadata compliance |
| `Name.field-meta.xml` | `metadata.test.js` | Field metadata, XML validity |
| `schema.json` | `schema.test.js` | JSON structure, schema completeness |
| `.tbls.yml` | `tbls-config.test.js` | YAML syntax, configuration settings |
| `README.md` | `schema-docs.test.js` | Markdown structure, content accuracy |
| `Account.md` | `schema-docs.test.js` | Documentation completeness, formatting |
| All files | `integration.test.js` | Cross-file consistency, data integrity |

## Quick Commands

```bash
# Watch mode (auto-rerun on file changes)
npx jest scripts/tests/validation --watch

# Run with coverage report
npx jest scripts/tests/validation --coverage

# Run single test by name
npx jest -t "should have valid XML structure"

# Run only integration tests
npx jest scripts/tests/validation/integration.test.js

# Verbose output
npx jest scripts/tests/validation --verbose
```

## Test Output Explained

### ✅ Success
/**
 * Validation tests for schema documentation JSON file
 * Tests the generated database schema documentation
 */

const fs = require('fs');
const path = require('path');

describe('Schema Documentation Validation', () => {
  const schemaPath = path.join(__dirname, '../../../docs/schema/schema.json');
  let schema;

  beforeAll(() => {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    schema = JSON.parse(schemaContent);
  });

  describe('Schema File Structure', () => {
    test('should exist and be readable', () => {
      expect(fs.existsSync(schemaPath)).toBe(true);
    });

    test('should be valid JSON', () => {
      expect(schema).toBeDefined();
      expect(typeof schema).toBe('object');
    });

    test('should have required top-level properties', () => {
      expect(schema).toHaveProperty('tables');
      expect(schema).toHaveProperty('driver');
    });

    test('should have tables as an array', () => {
      expect(Array.isArray(schema.tables)).toBe(true);
    });

    test('should have at least one table', () => {
      expect(schema.tables.length).toBeGreaterThan(0);
    });
  });

  describe('Driver Information', () => {
    test('should have driver object', () => {
      expect(schema.driver).toBeDefined();
      expect(typeof schema.driver).toBe('object');
    });

    test('should specify Salesforce CLI Metadata driver', () => {
      expect(schema.driver.name).toBe('Salesforce CLI Metadata driver');
    });

    test('should have database version', () => {
      expect(schema.driver).toHaveProperty('database_version');
      expect(typeof schema.driver.database_version).toBe('string');
    });
  });

  describe('Account Table Structure', () => {
    let accountTable;

    beforeAll(() => {
      accountTable = schema.tables.find(table => table.name === 'Account');
    });

    test('should have Account table', () => {
      expect(accountTable).toBeDefined();
    });

    test('should have correct table name', () => {
      expect(accountTable.name).toBe('Account');
    });

    test('should be marked as Standard object', () => {
      expect(accountTable.type).toBe('Standard object');
    });

    test('should have columns array', () => {
      expect(Array.isArray(accountTable.columns)).toBe(true);
      expect(accountTable.columns.length).toBeGreaterThan(0);
    });

    test('should have indexes array', () => {
      expect(Array.isArray(accountTable.indexes)).toBe(true);
      expect(accountTable.indexes.length).toBeGreaterThan(0);
    });

    test('should have constraints array', () => {
      expect(Array.isArray(accountTable.constraints)).toBe(true);
      expect(accountTable.constraints.length).toBeGreaterThan(0);
    });
  });

  describe('Account Table Columns', () => {
    let accountTable;

    beforeAll(() => {
      accountTable = schema.tables.find(table => table.name === 'Account');
    });

    test('should have Id column', () => {
      const idColumn = accountTable.columns.find(col => col.name === 'Id');
      expect(idColumn).toBeDefined();
    });

    test('Id column should have correct properties', () => {
      const idColumn = accountTable.columns.find(col => col.name === 'Id');
      expect(idColumn.type).toBe('Id');
      expect(idColumn.nullable).toBe(false);
      expect(idColumn.comment).toBe('Id');
    });

    test('should have Name column', () => {
      const nameColumn = accountTable.columns.find(col => col.name === 'Name');
      expect(nameColumn).toBeDefined();
    });

    test('Name column should have correct properties', () => {
      const nameColumn = accountTable.columns.find(col => col.name === 'Name');
      expect(nameColumn.type).toBe('Name');
      expect(nameColumn.nullable).toBe(false);
    });

    test('all columns should have required properties', () => {
      accountTable.columns.forEach(column => {
        expect(column).toHaveProperty('name');
        expect(column).toHaveProperty('type');
        expect(column).toHaveProperty('nullable');
        expect(typeof column.name).toBe('string');
        expect(typeof column.type).toBe('string');
        expect(typeof column.nullable).toBe('boolean');
      });
    });

    test('should have exactly 2 columns', () => {
      expect(accountTable.columns.length).toBe(2);
    });
  });

  describe('Account Table Indexes', () => {
    let accountTable;

    beforeAll(() => {
      accountTable = schema.tables.find(table => table.name === 'Account');
    });

    test('should have Id index', () => {
      const idIndex = accountTable.indexes.find(idx => idx.name === 'Id');
      expect(idIndex).toBeDefined();
    });

    test('Id index should be Primary Key', () => {
      const idIndex = accountTable.indexes.find(idx => idx.name === 'Id');
      expect(idIndex.def).toBe('Primary Key');
      expect(idIndex.table).toBe('Account');
      expect(idIndex.columns).toContain('Id');
    });

    test('should have Name index', () => {
      const nameIndex = accountTable.indexes.find(idx => idx.name === 'Name');
      expect(nameIndex).toBeDefined();
    });

    test('Name index should have correct properties', () => {
      const nameIndex = accountTable.indexes.find(idx => idx.name === 'Name');
      expect(nameIndex.def).toBe('Name');
      expect(nameIndex.table).toBe('Account');
      expect(nameIndex.columns).toContain('Name');
    });

    test('all indexes should have required properties', () => {
      accountTable.indexes.forEach(index => {
        expect(index).toHaveProperty('name');
        expect(index).toHaveProperty('def');
        expect(index).toHaveProperty('table');
        expect(index).toHaveProperty('columns');
        expect(typeof index.name).toBe('string');
        expect(typeof index.def).toBe('string');
        expect(typeof index.table).toBe('string');
        expect(Array.isArray(index.columns)).toBe(true);
      });
    });

    test('should have exactly 2 indexes', () => {
      expect(accountTable.indexes.length).toBe(2);
    });
  });

  describe('Account Table Constraints', () => {
    let accountTable;

    beforeAll(() => {
      accountTable = schema.tables.find(table => table.name === 'Account');
    });

    test('should have Id primary key constraint', () => {
      const pkConstraint = accountTable.constraints.find(c => c.name === 'Id');
      expect(pkConstraint).toBeDefined();
    });

    test('primary key constraint should have correct properties', () => {
      const pkConstraint = accountTable.constraints.find(c => c.name === 'Id');
      expect(pkConstraint.type).toBe('Primary Key');
      expect(pkConstraint.def).toBe('Primary Key');
      expect(pkConstraint.table).toBe('Account');
      expect(pkConstraint.columns).toContain('Id');
    });

    test('all constraints should have required properties', () => {
      accountTable.constraints.forEach(constraint => {
        expect(constraint).toHaveProperty('name');
        expect(constraint).toHaveProperty('type');
        expect(constraint).toHaveProperty('def');
        expect(constraint).toHaveProperty('table');
        expect(constraint).toHaveProperty('columns');
        expect(typeof constraint.name).toBe('string');
        expect(typeof constraint.type).toBe('string');
        expect(typeof constraint.def).toBe('string');
        expect(typeof constraint.table).toBe('string');
        expect(Array.isArray(constraint.columns)).toBe(true);
      });
    });

    test('should have exactly 1 constraint', () => {
      expect(accountTable.constraints.length).toBe(1);
    });
  });

  describe('Schema Consistency', () => {
    let accountTable;

    beforeAll(() => {
      accountTable = schema.tables.find(table => table.name === 'Account');
    });

    test('column names should match index column references', () => {
      const columnNames = accountTable.columns.map(col => col.name);
      accountTable.indexes.forEach(index => {
        index.columns.forEach(colName => {
          expect(columnNames).toContain(colName);
        });
      });
    });

    test('constraint columns should reference existing columns', () => {
      const columnNames = accountTable.columns.map(col => col.name);
      accountTable.constraints.forEach(constraint => {
        constraint.columns.forEach(colName => {
          expect(columnNames).toContain(colName);
        });
      });
    });

    test('primary key constraint should match primary key index', () => {
      const pkConstraint = accountTable.constraints.find(c => c.type === 'Primary Key');
      const pkIndex = accountTable.indexes.find(idx => idx.def === 'Primary Key');
      
      expect(pkConstraint.columns).toEqual(pkIndex.columns);
    });
  });

  describe('JSON Schema Edge Cases', () => {
    test('should handle special characters in values', () => {
      // Ensure JSON is properly escaped
      const rawContent = fs.readFileSync(schemaPath, 'utf8');
      expect(() => JSON.parse(rawContent)).not.toThrow();
    });

    test('should not have trailing commas', () => {
      const rawContent = fs.readFileSync(schemaPath, 'utf8');
      expect(rawContent).not.toMatch(/,\s*}/);
      expect(rawContent).not.toMatch(/,\s*\]/);
    });

    test('should use consistent indentation', () => {
      const rawContent = fs.readFileSync(schemaPath, 'utf8');
      const lines = rawContent.split('\n');
      const indentedLines = lines.filter(line => line.match(/^\s+/));
      
      // Check that indentation is consistent (2 spaces)
      indentedLines.forEach(line => {
        const indent = line.match(/^(\s+)/);
        if (indent) {
          expect(indent[1].length % 2).toBe(0);
        }
      });
    });

    test('should not contain undefined or null string literals', () => {
      const rawContent = fs.readFileSync(schemaPath, 'utf8');
      expect(rawContent).not.toContain('"undefined"');
      expect(rawContent).not.toContain(': undefined');
      expect(rawContent).not.toContain(': null,');
    });
  });
});
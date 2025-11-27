/**
 * Integration tests for the complete validation workflow
 * Tests the relationships and consistency across all files in the diff
 */

const fs = require('fs');
const path = require('path');

describe('Validation Integration Tests', () => {
  let schemaJson;
  let accountMd;
  let readmeMd;
  let tblsConfig;
  let accountObjectMeta;
  let nameFieldMeta;

  beforeAll(() => {
    // Load all relevant files
    schemaJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../../docs/schema/schema.json'), 'utf8')
    );
    accountMd = fs.readFileSync(
      path.join(__dirname, '../../../docs/schema/Account.md'),
      'utf8'
    );
    readmeMd = fs.readFileSync(
      path.join(__dirname, '../../../docs/schema/README.md'),
      'utf8'
    );
    tblsConfig = fs.readFileSync(
      path.join(__dirname, '../../../.tbls.yml'),
      'utf8'
    );
    accountObjectMeta = fs.readFileSync(
      path.join(__dirname, '../../../force-app/main/default/objects/Account/Account.object-meta.xml'),
      'utf8'
    );
    nameFieldMeta = fs.readFileSync(
      path.join(__dirname, '../../../force-app/main/default/objects/Account/fields/Name.field-meta.xml'),
      'utf8'
    );
  });

  describe('Configuration to Documentation Flow', () => {
    test('tbls config docPath should match actual documentation location', () => {
      expect(tblsConfig).toContain('docPath: docs/schema');
      expect(fs.existsSync(path.join(__dirname, '../../../docs/schema'))).toBe(true);
    });

    test('tbls config should specify mermaid format and documentation should contain mermaid', () => {
      expect(tblsConfig).toMatch(/format:\s*mermaid/);
      expect(readmeMd).toContain('```mermaid');
      expect(accountMd).toContain('```mermaid');
    });

    test('er.skip should be false and ER diagrams should be present', () => {
      expect(tblsConfig).toMatch(/skip:\s*false/);
      expect(readmeMd).toContain('erDiagram');
      expect(accountMd).toContain('erDiagram');
    });

    test('format.sort should be true and documentation should be sorted', () => {
      expect(tblsConfig).toMatch(/sort:\s*true/);
      // Check that columns in schema.json are in alphabetical order
      const accountTable = schemaJson.tables.find(t => t.name === 'Account');
      const columnNames = accountTable.columns.map(c => c.name);
      const sortedNames = [...columnNames].sort();
      expect(columnNames).toEqual(sortedNames);
    });
  });

  describe('Metadata to Schema Consistency', () => {
    test('Account object should exist in both metadata XML and schema JSON', () => {
      expect(accountObjectMeta).toContain('<CustomObject');
      expect(schemaJson.tables.find(t => t.name === 'Account')).toBeDefined();
    });

    test('Name field should exist in both field metadata and schema JSON', () => {
      expect(nameFieldMeta).toContain('<fullName>Name</fullName>');
      const accountTable = schemaJson.tables.find(t => t.name === 'Account');
      expect(accountTable.columns.find(c => c.name === 'Name')).toBeDefined();
    });

    test('field nullable settings should be consistent', () => {
      const accountTable = schemaJson.tables.find(t => t.name === 'Account');
      const nameColumn = accountTable.columns.find(c => c.name === 'Name');
      // Name field is required in schema
      expect(nameColumn.nullable).toBe(false);
    });
  });

  describe('Schema JSON to Markdown Consistency', () => {
    test('README should list all tables from schema.json', () => {
      schemaJson.tables.forEach(table => {
        expect(readmeMd).toContain(table.name);
      });
    });

    test('Account.md should document all columns from schema.json', () => {
      const accountTable = schemaJson.tables.find(t => t.name === 'Account');
      accountTable.columns.forEach(column => {
        expect(accountMd).toContain(column.name);
      });
    });

    test('Account.md should document all indexes from schema.json', () => {
      const accountTable = schemaJson.tables.find(t => t.name === 'Account');
      accountTable.indexes.forEach(index => {
        expect(accountMd).toContain(index.name);
      });
    });

    test('Account.md should document all constraints from schema.json', () => {
      const accountTable = schemaJson.tables.find(t => t.name === 'Account');
      accountTable.constraints.forEach(constraint => {
        expect(accountMd).toContain(constraint.name);
      });
    });

    test('column counts should match across schema.json and README', () => {
      const accountTable = schemaJson.tables.find(t => t.name === 'Account');
      const columnCount = accountTable.columns.length;
      expect(readmeMd).toMatch(new RegExp(`\\[Account\\].*\\|\\s*${columnCount}\\s*\\|`));
    });
  });

  describe('ER Diagram Consistency', () => {
    test('both README and Account.md should have consistent ER diagrams', () => {
      // Both should contain the Account entity
      expect(readmeMd).toMatch(/"Account"\s*\{/);
      expect(accountMd).toMatch(/"Account"\s*\{/);
    });

    test('ER diagrams should include all columns', () => {
      const accountTable = schemaJson.tables.find(t => t.name === 'Account');
      accountTable.columns.forEach(column => {
        const pattern = new RegExp(`${column.name}\\s+${column.type}`);
        expect(readmeMd).toMatch(pattern);
        expect(accountMd).toMatch(pattern);
      });
    });
  });

  describe('Documentation Attribution', () => {
    test('all generated markdown files should have tbls attribution', () => {
      const attribution = '> Generated by [tbls](https://github.com/k1LoW/tbls)';
      expect(readmeMd).toContain(attribution);
      expect(accountMd).toContain(attribution);
    });
  });

  describe('File Organization', () => {
    test('metadata files should follow Salesforce directory structure', () => {
      const objectPath = 'force-app/main/default/objects/Account/Account.object-meta.xml';
      const fieldPath = 'force-app/main/default/objects/Account/fields/Name.field-meta.xml';
      
      expect(fs.existsSync(path.join(__dirname, '../../..', objectPath))).toBe(true);
      expect(fs.existsSync(path.join(__dirname, '../../..', fieldPath))).toBe(true);
    });

    test('documentation files should be in docs/schema directory', () => {
      const files = ['README.md', 'Account.md', 'schema.json'];
      files.forEach(file => {
        const filePath = path.join(__dirname, '../../../docs/schema', file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test('configuration file should be in project root', () => {
      const configPath = path.join(__dirname, '../../../.tbls.yml');
      expect(fs.existsSync(configPath)).toBe(true);
    });
  });

  describe('Data Type Consistency', () => {
    test('Id field should be consistently typed across all files', () => {
      const accountTable = schemaJson.tables.find(t => t.name === 'Account');
      const idColumn = accountTable.columns.find(c => c.name === 'Id');
      
      expect(idColumn.type).toBe('Id');
      expect(accountMd).toMatch(/\|\s*Id\s*\|\s*Id\s*\|/);
    });

    test('Name field should be consistently typed across all files', () => {
      const accountTable = schemaJson.tables.find(t => t.name === 'Account');
      const nameColumn = accountTable.columns.find(c => c.name === 'Name');
      
      expect(nameColumn.type).toBe('Name');
      expect(accountMd).toMatch(/\|\s*Name\s*\|\s*Name\s*\|/);
    });
  });

  describe('Completeness Check', () => {
    test('all changed files in the diff should have corresponding validation', () => {
      const expectedFiles = [
        '.tbls.yml',
        'docs/schema/README.md',
        'docs/schema/Account.md',
        'docs/schema/schema.json',
        'force-app/main/default/objects/Account/Account.object-meta.xml',
        'force-app/main/default/objects/Account/fields/Name.field-meta.xml'
      ];

      expectedFiles.forEach(file => {
        const filePath = path.join(__dirname, '../../..', file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test('no orphaned documentation files exist', () => {
      // Every markdown file (except README) should have a corresponding entry in schema.json
      const docsDir = path.join(__dirname, '../../../docs/schema');
      const mdFiles = fs.readdirSync(docsDir)
        .filter(f => f.endsWith('.md') && f !== 'README.md');
      
      mdFiles.forEach(mdFile => {
        const tableName = mdFile.replace('.md', '');
        const tableExists = schemaJson.tables.some(t => t.name === tableName);
        expect(tableExists).toBe(true);
      });
    });
  });

  describe('Version Compatibility', () => {
    test('schema.json should specify driver version', () => {
      expect(schemaJson.driver).toHaveProperty('database_version');
      expect(schemaJson.driver).toHaveProperty('name');
    });

    test('XML files should specify Salesforce API version via namespace', () => {
      expect(accountObjectMeta).toContain('http://soap.sforce.com/2006/04/metadata');
      expect(nameFieldMeta).toContain('http://soap.sforce.com/2006/04/metadata');
    });
  });
});
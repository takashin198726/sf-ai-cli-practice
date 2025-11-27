/**
 * Validation tests for .tbls.yml configuration file
 * Tests the tbls (database documentation tool) configuration
 */

const fs = require('fs');
const path = require('path');

describe('tbls Configuration Validation', () => {
  const configPath = path.join(__dirname, '../../../.tbls.yml');
  let configContent;

  beforeAll(() => {
    configContent = fs.readFileSync(configPath, 'utf8');
  });

  describe('Configuration File Structure', () => {
    test('should exist and be readable', () => {
      expect(fs.existsSync(configPath)).toBe(true);
      expect(configContent).toBeTruthy();
      expect(configContent.length).toBeGreaterThan(0);
    });

    test('should be valid YAML format', () => {
      // Basic YAML validation checks
      expect(configContent).not.toContain('\t'); // No tabs in YAML
      expect(configContent.split('\n').every(line => {
        if (line.trim() === '') return true;
        if (line.startsWith('#')) return true;
        return line.match(/^[\s]*[a-zA-Z_-]+:\s*.*/);
      })).toBe(true);
    });

    test('should have consistent indentation', () => {
      const lines = configContent.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
      const indentedLines = lines.filter(line => line.match(/^\s+/));
      
      indentedLines.forEach(line => {
        const indent = line.match(/^(\s+)/);
        if (indent) {
          // YAML typically uses 2-space indentation
          expect(indent[1].length % 2).toBe(0);
        }
      });
    });
  });

  describe('DSN Configuration', () => {
    test('should have dsn field', () => {
      expect(configContent).toMatch(/^dsn:/m);
    });

    test('should use sf-cli-meta driver', () => {
      expect(configContent).toMatch(/dsn:\s*sf-cli-meta:\/\//);
    });

    test('should specify a valid project path', () => {
      const dsnMatch = configContent.match(/dsn:\s*sf-cli-meta:\/\/(.+)/);
      expect(dsnMatch).toBeTruthy();
      if (dsnMatch) {
        const projectPath = dsnMatch[1].trim();
        expect(projectPath).toBeTruthy();
        expect(projectPath.length).toBeGreaterThan(0);
        // Path should not have trailing slashes
        expect(projectPath).not.toMatch(/\/$/);
      }
    });
  });

  describe('Documentation Path Configuration', () => {
    test('should have docPath field', () => {
      expect(configContent).toMatch(/^docPath:/m);
    });

    test('should specify docs/schema as the documentation path', () => {
      expect(configContent).toMatch(/docPath:\s*docs\/schema/);
    });

    test('should use relative path for docPath', () => {
      const docPathMatch = configContent.match(/docPath:\s*(.+)/);
      if (docPathMatch) {
        const docPath = docPathMatch[1].trim();
        // Should not start with / (absolute path)
        expect(docPath).not.toMatch(/^\//);
      }
    });

    test('documentation path should exist', () => {
      const docsPath = path.join(__dirname, '../../../docs/schema');
      expect(fs.existsSync(docsPath)).toBe(true);
    });
  });

  describe('Format Configuration', () => {
    test('should have format section', () => {
      expect(configContent).toMatch(/^format:/m);
    });

    test('should have adjust setting in format', () => {
      expect(configContent).toMatch(/^\s+adjust:/m);
    });

    test('adjust should be set to false', () => {
      expect(configContent).toMatch(/adjust:\s*false/);
    });

    test('should have sort setting in format', () => {
      expect(configContent).toMatch(/^\s+sort:/m);
    });

    test('sort should be set to true', () => {
      expect(configContent).toMatch(/sort:\s*true/);
    });

    test('format settings should be boolean values', () => {
      const adjustMatch = configContent.match(/adjust:\s*(\w+)/);
      const sortMatch = configContent.match(/sort:\s*(\w+)/);
      
      if (adjustMatch) {
        expect(['true', 'false']).toContain(adjustMatch[1]);
      }
      if (sortMatch) {
        expect(['true', 'false']).toContain(sortMatch[1]);
      }
    });
  });

  describe('ER Diagram Configuration', () => {
    test('should have er section', () => {
      expect(configContent).toMatch(/^er:/m);
    });

    test('should have format setting in er', () => {
      expect(configContent).toMatch(/^\s+format:/m);
    });

    test('er format should be set to mermaid', () => {
      expect(configContent).toMatch(/format:\s*mermaid/);
    });

    test('should have skip setting in er', () => {
      expect(configContent).toMatch(/^\s+skip:/m);
    });

    test('skip should be set to false', () => {
      expect(configContent).toMatch(/skip:\s*false/);
    });

    test('er format should be a valid option', () => {
      const formatMatch = configContent.match(/^\s+format:\s*(\w+)/m);
      if (formatMatch) {
        const validFormats = ['dot', 'mermaid', 'plantuml', 'svg'];
        expect(validFormats).toContain(formatMatch[1]);
      }
    });
  });

  describe('Configuration Completeness', () => {
    test('should have all required top-level keys', () => {
      const requiredKeys = ['dsn', 'docPath', 'format', 'er'];
      requiredKeys.forEach(key => {
        expect(configContent).toMatch(new RegExp(`^${key}:`, 'm'));
      });
    });

    test('should not have duplicate keys', () => {
      const lines = configContent.split('\n').filter(line => line.match(/^[a-zA-Z_-]+:/));
      const keys = lines.map(line => line.split(':')[0].trim());
      const uniqueKeys = [...new Set(keys)];
      expect(keys.length).toBe(uniqueKeys.length);
    });

    test('should not contain empty values', () => {
      const lines = configContent.split('\n').filter(line => line.includes(':'));
      lines.forEach(line => {
        if (line.match(/:\s*$/)) {
          // Lines ending with : should be parent keys with nested config
          expect(line).toMatch(/^[a-zA-Z_-]+:\s*$/);
        }
      });
    });
  });

  describe('Configuration Security', () => {
    test('should not contain sensitive information in DSN', () => {
      expect(configContent).not.toMatch(/password/i);
      expect(configContent).not.toMatch(/token/i);
      expect(configContent).not.toMatch(/secret/i);
      expect(configContent).not.toMatch(/apikey/i);
    });

    test('should not contain hardcoded credentials', () => {
      expect(configContent).not.toMatch(/:\w+@/); // user:pass@ pattern
      expect(configContent).not.toMatch(/Bearer\s+/i);
    });
  });

  describe('Configuration Best Practices', () => {
    test('should not have trailing whitespace', () => {
      const lines = configContent.split('\n');
      lines.forEach(line => {
        if (line.length > 0) {
          expect(line).not.toMatch(/\s+$/);
        }
      });
    });

    test('should end with newline', () => {
      expect(configContent).toMatch(/\n$/);
    });

    test('should use lowercase for boolean values', () => {
      const booleanMatches = configContent.match(/:\s*(true|false|True|False|TRUE|FALSE)/g);
      if (booleanMatches) {
        booleanMatches.forEach(match => {
          expect(match).toMatch(/:\s*(true|false)/);
        });
      }
    });

    test('should have consistent key naming (lowercase with hyphens or underscores)', () => {
      const keys = configContent.match(/^[a-zA-Z_-]+:/gm);
      if (keys) {
        keys.forEach(key => {
          const keyName = key.replace(':', '').trim();
          expect(keyName).toMatch(/^[a-z][a-zA-Z_-]*$/);
        });
      }
    });
  });
});
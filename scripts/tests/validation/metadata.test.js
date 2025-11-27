/**
 * Validation tests for Salesforce metadata XML files
 * Tests the Account object metadata and field definitions
 */

const fs = require('fs');
const path = require('path');

describe('Salesforce Metadata Validation', () => {
  describe('Account Object Metadata', () => {
    const accountMetadataPath = path.join(
      __dirname,
      '../../../force-app/main/default/objects/Account/Account.object-meta.xml'
    );
    let accountMetadata;

    beforeAll(() => {
      accountMetadata = fs.readFileSync(accountMetadataPath, 'utf8');
    });

    test('should exist and be readable', () => {
      expect(fs.existsSync(accountMetadataPath)).toBe(true);
      expect(accountMetadata).toBeTruthy();
      expect(accountMetadata.length).toBeGreaterThan(0);
    });

    test('should have valid XML structure', () => {
      expect(accountMetadata).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
      expect(accountMetadata).toContain('<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">');
      expect(accountMetadata).toContain('</CustomObject>');
    });

    test('should contain required action overrides', () => {
      expect(accountMetadata).toContain('<actionOverrides>');
      expect(accountMetadata).toContain('<actionName>CallHighlightAction</actionName>');
      expect(accountMetadata).toContain('<type>Default</type>');
      expect(accountMetadata).toContain('</actionOverrides>');
    });

    test('should have compact layout assignment', () => {
      expect(accountMetadata).toContain('<compactLayoutAssignment>SYSTEM</compactLayoutAssignment>');
    });

    test('should enable feeds', () => {
      expect(accountMetadata).toContain('<enableFeeds>true</enableFeeds>');
    });

    test('should have history disabled', () => {
      expect(accountMetadata).toContain('<enableHistory>false</enableHistory>');
    });

    test('should have external sharing model set to Private', () => {
      expect(accountMetadata).toContain('<externalSharingModel>Private</externalSharingModel>');
    });

    test('should have internal sharing model set to ReadWrite', () => {
      expect(accountMetadata).toContain('<sharingModel>ReadWrite</sharingModel>');
    });

    test('should contain search layouts configuration', () => {
      expect(accountMetadata).toContain('<searchLayouts>');
      expect(accountMetadata).toContain('</searchLayouts>');
    });

    test('should have custom tab list additional fields', () => {
      expect(accountMetadata).toContain('<customTabListAdditionalFields>ACCOUNT.NAME</customTabListAdditionalFields>');
      expect(accountMetadata).toContain('<customTabListAdditionalFields>ACCOUNT.ADDRESS1_CITY</customTabListAdditionalFields>');
      expect(accountMetadata).toContain('<customTabListAdditionalFields>ACCOUNT.PHONE1</customTabListAdditionalFields>');
    });

    test('should have lookup dialog additional fields', () => {
      expect(accountMetadata).toContain('<lookupDialogsAdditionalFields>ACCOUNT.NAME</lookupDialogsAdditionalFields>');
      expect(accountMetadata).toContain('<lookupDialogsAdditionalFields>ACCOUNT.SITE</lookupDialogsAdditionalFields>');
      expect(accountMetadata).toContain('<lookupDialogsAdditionalFields>CORE.USERS.ALIAS</lookupDialogsAdditionalFields>');
      expect(accountMetadata).toContain('<lookupDialogsAdditionalFields>ACCOUNT.TYPE</lookupDialogsAdditionalFields>');
    });

    test('should have lookup phone dialog additional fields', () => {
      expect(accountMetadata).toContain('<lookupPhoneDialogsAdditionalFields>ACCOUNT.NAME</lookupPhoneDialogsAdditionalFields>');
      expect(accountMetadata).toContain('<lookupPhoneDialogsAdditionalFields>ACCOUNT.PHONE1</lookupPhoneDialogsAdditionalFields>');
    });

    test('should have search results additional fields', () => {
      expect(accountMetadata).toContain('<searchResultsAdditionalFields>ACCOUNT.NAME</searchResultsAdditionalFields>');
      expect(accountMetadata).toContain('<searchResultsAdditionalFields>ACCOUNT.SITE</searchResultsAdditionalFields>');
      expect(accountMetadata).toContain('<searchResultsAdditionalFields>ACCOUNT.PHONE1</searchResultsAdditionalFields>');
      expect(accountMetadata).toContain('<searchResultsAdditionalFields>CORE.USERS.ALIAS</searchResultsAdditionalFields>');
    });

    test('should not contain syntax errors or unclosed tags', () => {
      const openTags = (accountMetadata.match(/<(?!\/)[^>]+>/g) || []).length;
      const closeTags = (accountMetadata.match(/<\/[^>]+>/g) || []).length;
      const selfClosingTags = (accountMetadata.match(/<[^>]+\/>/g) || []).length;
      
      // All opening tags should have corresponding closing tags (minus self-closing and XML declaration)
      expect(openTags - selfClosingTags - 1).toBe(closeTags); // -1 for XML declaration
    });

    test('should have proper XML namespace', () => {
      expect(accountMetadata).toMatch(/xmlns="http:\/\/soap\.sforce\.com\/2006\/04\/metadata"/);
    });

    test('should not contain empty or malformed tags', () => {
      expect(accountMetadata).not.toMatch(/<>\s*<\/>/);
      expect(accountMetadata).not.toMatch(/<[^>]*<[^>]*>/);
    });
  });

  describe('Account Name Field Metadata', () => {
    const nameFieldPath = path.join(
      __dirname,
      '../../../force-app/main/default/objects/Account/fields/Name.field-meta.xml'
    );
    let nameFieldMetadata;

    beforeAll(() => {
      nameFieldMetadata = fs.readFileSync(nameFieldPath, 'utf8');
    });

    test('should exist and be readable', () => {
      expect(fs.existsSync(nameFieldPath)).toBe(true);
      expect(nameFieldMetadata).toBeTruthy();
      expect(nameFieldMetadata.length).toBeGreaterThan(0);
    });

    test('should have valid XML structure', () => {
      expect(nameFieldMetadata).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
      expect(nameFieldMetadata).toContain('<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">');
      expect(nameFieldMetadata).toContain('</CustomField>');
    });

    test('should have fullName set to Name', () => {
      expect(nameFieldMetadata).toContain('<fullName>Name</fullName>');
    });

    test('should enable feed history tracking', () => {
      expect(nameFieldMetadata).toContain('<trackFeedHistory>true</trackFeedHistory>');
    });

    test('should have proper XML namespace', () => {
      expect(nameFieldMetadata).toMatch(/xmlns="http:\/\/soap\.sforce\.com\/2006\/04\/metadata"/);
    });

    test('should not contain syntax errors', () => {
      const openTags = (nameFieldMetadata.match(/<(?!\/)[^>]+>/g) || []).length;
      const closeTags = (nameFieldMetadata.match(/<\/[^>]+>/g) || []).length;
      const selfClosingTags = (nameFieldMetadata.match(/<[^>]+\/>/g) || []).length;
      
      expect(openTags - selfClosingTags - 1).toBe(closeTags);
    });

    test('should be a minimal and focused field definition', () => {
      // Field metadata should only contain fullName and trackFeedHistory
      const lines = nameFieldMetadata.split('\n').filter(line => line.trim() && !line.includes('<?xml') && !line.includes('<CustomField') && !line.includes('</CustomField>'));
      expect(lines.length).toBe(2);
    });
  });

  describe('Metadata File Location and Naming Conventions', () => {
    test('Account object metadata should follow Salesforce directory structure', () => {
      const expectedPath = 'force-app/main/default/objects/Account/Account.object-meta.xml';
      expect(fs.existsSync(path.join(__dirname, '../../../', expectedPath))).toBe(true);
    });

    test('Name field metadata should follow Salesforce field directory structure', () => {
      const expectedPath = 'force-app/main/default/objects/Account/fields/Name.field-meta.xml';
      expect(fs.existsSync(path.join(__dirname, '../../../', expectedPath))).toBe(true);
    });

    test('should use correct file naming convention for object metadata', () => {
      const objectMetaPath = 'force-app/main/default/objects/Account/Account.object-meta.xml';
      expect(objectMetaPath).toMatch(/.*\.object-meta\.xml$/);
    });

    test('should use correct file naming convention for field metadata', () => {
      const fieldMetaPath = 'force-app/main/default/objects/Account/fields/Name.field-meta.xml';
      expect(fieldMetaPath).toMatch(/.*\.field-meta\.xml$/);
    });
  });
});
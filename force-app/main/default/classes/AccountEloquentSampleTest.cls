/**
 * @description サンプルテストクラス - ApexEloquent を使用したテストデータ生成のデモ
 * @group Unit Tests
 */
@isTest
private class AccountEloquentSampleTest {
    /**
     * @description ApexEloquent を使用した Account レコードの作成テスト
     */
    @isTest
    static void testAccountCreationWithEloquent() {
        // Eloquent を使って Account レコードを生成
        Eloquent accountEloquent = new Eloquent(Account.SObjectType);
        
        accountEloquent
            .set('Name', 'Test Account Eloquent')
            .set('Industry', 'Technology')
            .set('AnnualRevenue', 1000000);
        
        Test.startTest();
        // レコードを Insert
        Account testAccount = (Account) accountEloquent.save();
        Test.stopTest();
        
        // 検証
        Account insertedAccount = [SELECT Id, Name, Industry, AnnualRevenue 
                                    FROM Account 
                                    WHERE Id = :testAccount.Id LIMIT 1];
        
        System.assertEquals('Test Account Eloquent', insertedAccount.Name, 
                          'Account Name should match');
        System.assertEquals('Technology', insertedAccount.Industry, 
                          'Industry should be set correctly');
        System.assertEquals(1000000, insertedAccount.AnnualRevenue, 
                          'Annual Revenue should be set correctly');
    }
    
    /**
     * @description Mock を使用した Query テストのデモ
     */
    @isTest
    static void testMockEloquentQuery() {
        // Mock Eloquent を使ってテストデータを準備（実際のDMLなし）
        MockEloquent mockAccountEloquent = new MockEloquent(Account.SObjectType);
        
        mockAccountEloquent
            .set('Id', fflib_IDGenerator.generate(Account.SObjectType))
            .set('Name', 'Mock Account')
            .set('Industry', 'Finance');
        
        Account mockAccount = (Account) mockAccountEloquent.toSObject();
        
        // 検証
        System.assertNotNull(mockAccount.Id, 'Mock Account should have an ID');
        System.assertEquals('Mock Account', mockAccount.Name, 
                          'Mock Account Name should match');
        System.assertEquals('Finance', mockAccount.Industry, 
                          'Mock Account Industry should be Finance');
    }
}

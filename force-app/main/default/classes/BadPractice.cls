public class BadPractice {
  public void breakLimits() {
    for (Integer i = 0; i < 100; i++) {
      // Bad: Loop SOQL
      List<Account> accs = [SELECT Id, Name FROM Account WHERE Name = 'Test' LIMIT 1];

      if (accs.size() > 0) {
        Account acc = accs[0];
        // Bad: Hardcoding & DML inside loop
        acc.Name = 'Updated Name';
        update acc;
      }
    }
  }
}

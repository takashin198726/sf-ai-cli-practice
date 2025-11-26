# Specification: String Utility Class

## Overview

Create a `StringUtil` Apex class that provides common string manipulation methods not found in the standard `String` class.

## Requirements

### 1. `reverse(String input)`

- **Description**: Reverses the given input string.
- **Input**: `String` (e.g., "hello")
- **Output**: `String` (e.g., "olleh")
- **Edge Cases**:
  - If input is `null`, return `null`.
  - If input is empty, return empty string.

### 2. `toTitleCase(String input)`

- **Description**: Converts a string to title case (first letter of each word capitalized, others lowercase).
- **Input**: `String` (e.g., "hello world")
- **Output**: `String` (e.g., "Hello World")
- **Edge Cases**:
  - If input is `null`, return `null`.
  - Handle multiple spaces correctly.

### 3. `isPalindrome(String input)`

- **Description**: Checks if the input string is a palindrome (reads the same forwards and backwards), ignoring case and non-alphanumeric characters.
- **Input**: `String` (e.g., "A man, a plan, a canal: Panama")
- **Output**: `Boolean` (true)
- **Edge Cases**:
  - If input is `null`, return `false`.
  - Empty string is considered a palindrome.

## Constraints

- Must be bulkified where applicable (though these are utility methods).
- Must include comprehensive unit tests.

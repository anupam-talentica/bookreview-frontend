# Frontend Test Suite

This directory contains comprehensive test cases for the BookReview frontend application.

## Test Structure

```
__tests__/
├── components/           # Component tests
│   ├── FavoriteButton.test.tsx
│   ├── Header.test.tsx
│   └── RecommendationDashboard.test.tsx
├── contexts/            # Context tests
│   └── AuthContext.test.tsx
├── pages/               # Page component tests
│   ├── HomePage.test.tsx
│   └── LoginPage.test.tsx
├── services/            # Service layer tests
│   └── api.test.ts
├── types/               # Type definition tests
│   └── index.test.ts
├── utils/               # Test utilities
│   └── test-utils.tsx
├── App.test.tsx         # Main app component test
└── README.md           # This file
```

## Test Categories

### 1. Component Tests
- **FavoriteButton**: Tests favorite/unfavorite functionality, authentication states, loading states
- **Header**: Tests navigation, search functionality, user menu, responsive behavior
- **RecommendationDashboard**: Tests recommendation display, tabs, feedback, error states

### 2. Context Tests
- **AuthContext**: Tests authentication state management, login/logout, token validation

### 3. Page Tests
- **HomePage**: Tests hero section, book sections, statistics, authenticated vs unauthenticated views
- **LoginPage**: Tests form validation, authentication flow, error handling

### 4. Service Tests
- **API Service**: Tests all API endpoints, request/response handling, error scenarios

### 5. Type Tests
- **Type Definitions**: Validates TypeScript interfaces and type safety

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run specific test file
```bash
npm test -- FavoriteButton.test.tsx
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="should render"
```

## Test Utilities

The `test-utils.tsx` file provides:
- Custom render function with all providers
- Mock data factories
- Common test scenarios
- Helper functions for async operations

## Mocking Strategy

### External Dependencies
- **React Router**: Mocked navigation functions
- **Material-UI**: Uses real components for integration testing
- **React Query**: Uses real QueryClient with disabled retry/cache
- **API Service**: Fully mocked with jest.mock()

### Internal Dependencies
- **AuthContext**: Mocked to control authentication state
- **Components**: Selectively mocked for isolation when needed

## Test Coverage Goals

- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >90%
- **Lines**: >90%

## Best Practices

1. **Arrange-Act-Assert**: Clear test structure
2. **Descriptive Names**: Test names describe the scenario and expected outcome
3. **Isolation**: Each test is independent and can run in any order
4. **Realistic Data**: Use factory functions for consistent test data
5. **Error Scenarios**: Test both happy path and error conditions
6. **Accessibility**: Include accessibility-focused tests where relevant
7. **Performance**: Mock heavy operations and external dependencies

## Common Test Patterns

### Testing Async Operations
```typescript
await waitFor(() => {
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### Testing User Interactions
```typescript
fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
```

### Testing Form Validation
```typescript
const submitButton = screen.getByRole('button', { name: 'Submit' });
fireEvent.click(submitButton);

await waitFor(() => {
  expect(screen.getByText('Field is required')).toBeInTheDocument();
});
```

### Testing API Calls
```typescript
mockedApiService.getBooks.mockResolvedValue(mockBooks);

// Trigger component that calls API
// ...

await waitFor(() => {
  expect(mockedApiService.getBooks).toHaveBeenCalledWith(expectedParams);
});
```

## Debugging Tests

### View rendered output
```typescript
import { screen } from '@testing-library/react';
screen.debug(); // Prints current DOM
```

### Check what queries are available
```typescript
screen.logTestingPlaygroundURL(); // Opens testing playground
```

### Increase timeout for slow tests
```typescript
await waitFor(() => {
  // assertion
}, { timeout: 5000 });
```

## Integration with CI/CD

Tests are configured to run in CI environments with:
- Headless mode enabled
- Coverage reporting
- JUnit XML output for test reporting
- Fail-fast on first test failure in production builds

## Dependencies

### Testing Framework
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Additional Jest matchers

### Mocking
- **Jest mocks**: For module and function mocking
- **MSW** (if needed): For API mocking in integration tests

### Type Checking
- **TypeScript**: Ensures type safety in tests
- **@types/jest**: TypeScript definitions for Jest

# Testing Documentation

This directory contains all test suites for the LessonPortal application.

## Test Structure

```
tests/
├── unit/               # Unit tests
├── integration/        # Integration tests
├── e2e/               # End-to-end tests
└── performance/        # Performance tests
```

## Running Tests

### Unit Tests

Tests individual components and functions.

```bash
npm run test:unit
```

Coverage report will be generated in `coverage/unit/`.

### Integration Tests

Tests interaction between components and services.

```bash
npm run test:integration
```

Coverage report will be generated in `coverage/integration/`.

### E2E Tests

Tests complete user flows.

```bash
npm run test:e2e
```

Videos and screenshots will be saved in `tests/e2e/artifacts/`.

### Performance Tests

Tests application performance metrics.

```bash
npm run test:performance
```

Reports will be generated in `tests/performance/reports/`.

## Writing Tests

### Unit Test Example

```typescript
import { render, screen } from '@testing-library/react';
import { Profile } from '@/pages/Profile';

describe('Profile', () => {
  it('renders profile information', () => {
    render(<Profile />);
    expect(screen.getByText('Perfil')).toBeInTheDocument();
  });

  it('updates profile successfully', async () => {
    // Test implementation
  });
});
```

### Integration Test Example

```typescript
import { test, expect } from '@playwright/test';

test('user can update profile', async ({ page }) => {
  // Test implementation
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('complete user journey', async ({ page }) => {
  // Test implementation
});
```

### Performance Test Example

```typescript
import { test } from '@playwright/test';
import lighthouse from 'lighthouse';

test('performance metrics', async ({ page }) => {
  // Test implementation
});
```

## Test Coverage Requirements

Minimum coverage requirements:

- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

## CI/CD Integration

Tests are automatically run on:
- Pull requests
- Merges to main branch
- Production deployments

## Performance Benchmarks

- Page Load Time: < 2s
- Time to Interactive: < 3s
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

## Error Tracking

All test failures are logged with:
- Stack trace
- Screenshots (for E2E tests)
- Console logs
- Network requests

## Best Practices

1. Follow AAA pattern (Arrange, Act, Assert)
2. Use meaningful test descriptions
3. Mock external dependencies
4. Clean up after tests
5. Keep tests independent
6. Use test data factories
7. Avoid test interdependence
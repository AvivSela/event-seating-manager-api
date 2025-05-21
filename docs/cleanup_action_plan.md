# Code Cleanup Action Plan

## Phase 1: Code Organization and Test Utilities
1. Create a new `src/utils/testUtils.ts` file
   - Move `clearEvents()` from `eventController.ts`
   - Move `clearVenues()` from `venueController.ts`
   - Add proper documentation for test utility functions

2. Clean up route organization:
   ```typescript
   // Tasks:
   - Review and implement proper user-event relationships in userEventRoutes.ts
   - OR merge the minimal functionality into userRoutes.ts
   - Update related tests accordingly
   ```

## Phase 2: Code Formatting and Style
1. Fix empty lines and formatting:
   ```typescript
   // Files to clean:
   - src/controllers/venueController.ts (lines 29, 136)
   - src/types/venue.ts (line 20)
   ```

2. Implement consistent error handling:
   ```typescript
   // Create standardized error handling:
   - Define custom error classes
   - Replace generic "Something went wrong!" messages
   - Implement proper error logging
   ```

## Phase 3: Dead Code Removal
1. Audit CRUD operations:
   ```typescript
   // Steps:
   - Map all API endpoints to their usage
   - Document unused endpoints
   - Remove confirmed unused operations
   - Update tests to reflect changes
   ```

2. Clean up .gitignore:
   ```
   // Remove entries for:
   - Python-related patterns
   - Unnecessary IDE patterns
   - Keep only Node.js and project-specific patterns
   ```

## Phase 4: Test Improvements
1. Refactor test setup:
   ```typescript
   // Create in src/__tests__/helpers:
   - Common test fixtures
   - Shared test data factories
   - Test utility functions
   ```

2. Implement proper logging:
   ```typescript
   // Replace console.error with proper logging:
   - Add a logging library (e.g., winston)
   - Create logging utility functions
   - Add appropriate log levels
   ```

## Execution Order and Commands

1. First, create test utilities:
```bash
# Create test utilities directory
mkdir -p src/utils
touch src/utils/testUtils.ts
```

2. Clean up code formatting:
```bash
# Install and run prettier
npm install --save-dev prettier
npx prettier --write src/**/*.ts
```

3. Implement error handling:
```bash
# Create error utilities
mkdir -p src/utils/errors
touch src/utils/errors/customErrors.ts
touch src/utils/errors/errorHandler.ts
```

4. Set up logging:
```bash
# Install logging library
npm install winston
mkdir -p src/utils/logging
touch src/utils/logging/logger.ts
```

## Testing Strategy

After each phase:
1. Run the full test suite:
```bash
npm test
```

2. Verify API functionality:
```bash
# Start the server in test mode
npm run start:test
```

3. Run integration tests:
```bash
npm run test:integration
```

## Safety Measures

Before making any changes:
1. Create a new git branch:
```bash
git checkout -b cleanup/code-improvements
```

2. Commit changes in small, logical chunks:
```bash
git add src/utils/testUtils.ts
git commit -m "refactor: move test utilities to dedicated file"
```

3. Create backup points:
```bash
git tag cleanup-backup-phase1
```

## Rollback Plan

If issues arise:
```bash
# Revert to last stable state
git tag
git checkout cleanup-backup-phase1
```

## Success Criteria

- [ ] All tests passing
- [ ] No unused code in production
- [ ] Consistent error handling
- [ ] Proper logging implemented
- [ ] Clean and organized test setup
- [ ] Simplified .gitignore
- [ ] Documentation updated

Remember to:
- Make one change at a time
- Test thoroughly after each change
- Update documentation as you go
- Keep the team informed of significant changes 
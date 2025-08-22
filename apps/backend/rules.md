# Backend Code Quality Rules & Standards

## 📋 Core Development Standards

### 1. File Structure & Size Limits
- **Maximum file size**: 150 lines (200 lines only if absolutely necessary)
- **Single Responsibility**: Each file should have one clear purpose
- **Modular Design**: Break large implementations into focused modules
- **Directory Structure**: Follow modular monolith architecture patterns

### 2. ESLint Configuration & Rules

#### Critical Error Rules (Must Fix)
```typescript
// ❌ NEVER use 'any' type
const data: any = response; // ERROR

// ✅ Use proper typing
interface ApiResponse { id: string; name: string; }
const data: ApiResponse = response;
```

#### Type Safety Rules
- `@typescript-eslint/no-explicit-any`: **ERROR** - Never use `any` type
- `@typescript-eslint/strict-boolean-expressions`: Enforce strict boolean checks
- `@typescript-eslint/no-floating-promises`: All promises must be handled
- `@typescript-eslint/explicit-function-return-type`: All functions need return types

#### Code Quality Rules
```typescript
// ❌ Missing return type
function processData(input) {
  return input.map(x => x.id);
}

// ✅ Explicit return type
function processData(input: DataItem[]): string[] {
  return input.map(x => x.id);
}
```

#### Variable & Import Rules
- `@typescript-eslint/no-unused-vars`: Error for unused variables (prefix with `_` if intentional)
- Clean unused imports automatically
- Use descriptive variable names

### 3. Console & Logging Rules

#### Development vs Production Logging
```typescript
// ❌ Console.log in production code
console.log('User data:', userData);

// ✅ Comment for development, use proper logging for production
// console.log('User data:', userData); // Dev only
console.error('Authentication failed:', error); // Production OK
console.warn('Rate limit approaching:', rateLimitInfo); // Production OK
```

**Allowed Console Methods**: `console.error`, `console.warn`  
**Forbidden**: `console.log`, `console.info`, `console.debug`

### 4. Operator Usage Rules

#### Nullish Coalescing vs Logical OR
```typescript
// ❌ Logical OR for null/undefined checks
const port = process.env.PORT || 3000;
const name = user.name || 'Anonymous';

// ✅ Nullish coalescing for null/undefined
const port = process.env.PORT ?? 3000;
const name = user.name ?? 'Anonymous';

// ✅ Logical OR for falsy value validation (correct usage)
if (!user || !user.id || !user.email) {
  throw new Error('Invalid user');
}
```

### 5. TypeScript Strict Mode Compliance

#### Interface Definitions
```typescript
// ❌ Avoid Record<string, any>
interface UserData extends Record<string, any> {}

// ✅ Explicit interface definitions
interface UserData {
  id: string;
  email: string;
  phone?: string;
  metadata: Record<string, unknown>; // When truly unknown
}
```

#### Promise Handling
```typescript
// ❌ Floating promises
initializeServices();

// ✅ Proper promise handling
void initializeServices();
// OR
await initializeServices();
// OR
initializeServices().catch(console.error);
```

## 🏗️ Architecture Rules

### 1. Modular Monolith Structure
```
src/
├── modules/           # Business modules
│   ├── auth/         # Authentication module
│   ├── users/        # User management
│   └── payments/     # Payment processing
├── event-bus/        # Event system
├── db/              # Database layer
└── api/             # API layer
```

### 2. Event-Driven Communication
- **Inter-module communication**: Use event bus only
- **No direct imports**: Between business modules
- **Event schemas**: Strongly typed with Zod validation
- **Event naming**: `module.entity.action` format

```typescript
// ✅ Event-driven module communication
eventBus.publish('auth.user.registered', {
  userId: '123',
  userType: 'individual',
  phone: '+1234567890'
});

// ❌ Direct module imports
import { UserService } from '../users/service'; // WRONG
```

### 3. Database Schema Rules
- **Drizzle ORM**: Required for all database operations
- **Type Safety**: All queries must be type-safe
- **Migrations**: Always use Drizzle migrations
- **Indexes**: Define appropriate indexes for performance

## 🛠️ Development Workflow

### 1. Code Quality Gates
Before any commit:
1. **ESLint**: Must pass with 0 errors, 0 warnings
2. **TypeScript**: Must compile in strict mode
3. **Tests**: All tests must pass
4. **File Size**: No file over 150 lines

### 2. Commit Standards
```bash
# Run quality checks
npx eslint src           # Must be clean
npx tsc --noEmit        # Must compile
bun test                # Must pass
```

### 3. Code Review Checklist
- [ ] No `any` types used
- [ ] All functions have return types
- [ ] Console.log statements removed/commented
- [ ] Proper error handling
- [ ] Event-driven architecture followed
- [ ] File size limits respected

## 🚫 Forbidden Patterns

### Anti-Patterns to Avoid
```typescript
// ❌ NEVER DO THESE
const data: any = await api.call();
function helper(input) { return input; }
console.log('Debug info:', data);
import { DirectService } from '../other-module';

// ✅ CORRECT PATTERNS
interface ApiData { id: string; }
const data: ApiData = await api.call();
function helper(input: string): string { return input; }
// console.log('Debug info:', data);
eventBus.publish('module.action', data);
```

## 📈 Performance Rules

### 1. Event Bus Performance
- **Batch operations**: Use batch publishing when possible
- **Async handlers**: All event handlers must be async
- **Error isolation**: Handlers should not crash the event bus

### 2. Database Performance
- **Connection pooling**: Use efficient connection management
- **Query optimization**: Avoid N+1 problems
- **Proper indexing**: Index frequently queried fields

## 🔒 Security Rules

### 1. Data Handling
- **No secrets in code**: Use environment variables
- **Input validation**: Validate all external inputs
- **SQL injection**: Use parameterized queries only
- **XSS prevention**: Sanitize all outputs

### 2. Authentication & Authorization
- **JWT handling**: Secure token management
- **Rate limiting**: Implement proper rate limits
- **CORS**: Configure appropriate CORS policies

## 📝 Documentation Standards

### 1. Code Comments
```typescript
// ✅ Good comments - explain WHY, not WHAT
// Cache user data to avoid repeated database calls during session
const userCache = new Map<string, UserData>();

// ❌ Bad comments - explain obvious things
// Create a new map
const userCache = new Map();
```

### 2. API Documentation
- **OpenAPI/Swagger**: Document all endpoints
- **Type definitions**: Export types for client usage
- **Error responses**: Document all possible error scenarios

## ⚡ Quick Reference Checklist

**Before every commit:**
- [ ] `npx eslint src` shows 0 problems
- [ ] All files under 150 lines
- [ ] No `any` types
- [ ] No `console.log` statements
- [ ] All functions have return types
- [ ] Used `??` for null/undefined checks
- [ ] Event-driven architecture maintained
- [ ] TypeScript strict mode compliant

**Code Quality Score: 10/10 🎯**

This document ensures maximum code quality and maintainability for the Metropolitan App backend.
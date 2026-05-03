# Contributing Guide

## Development Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/roastery-ecommerce.git
cd roastery-ecommerce

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## Development Workflow

### Branch Naming

- `feature/xxx` - New features
- `fix/xxx` - Bug fixes
- `docs/xxx` - Documentation updates
- `refactor/xxx` - Code refactoring
- `test/xxx` - Test updates

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add payment integration
fix: resolve cart calculation error
docs: update installation guide
refactor: simplify API client
test: add unit tests for checkout
```

### Pull Request Process

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Run lint: `npm run lint`
5. Run type check: `npm run type-check`
6. Create a pull request
7. Wait for CI to pass
8. Request review

### Code Style

- Follow ESLint rules
- Use Prettier for formatting
- Write TypeScript types
- Add JSDoc comments for complex functions

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Coverage

```bash
npm run test:coverage
```

## CI/CD

All pull requests trigger:

- Lint check
- Type check
- Unit tests
- Build

Merges to main trigger:

- All above checks
- E2E tests
- Deployment

## Questions?

Open an issue for:

- Bug reports
- Feature requests
- Questions

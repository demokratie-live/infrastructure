# Husky Git Hooks Configuration

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality and security checks before commits and pushes, implementing a comprehensive shift-left approach to catch issues early in the development process.

## Overview

The git hooks are configured to run at different stages:

1. **pre-commit**: Runs on staged files before commit
2. **commit-msg**: Validates commit message format
3. **pre-push**: Runs comprehensive checks before pushing to remote

## Pre-commit Hook

The pre-commit hook runs **lint-staged** which performs the following checks on staged files:

### TypeScript/JavaScript Files (*.ts, *.js)
- ✅ **ESLint**: Automatically fixes linting issues
- ✅ **Prettier**: Formats code consistently
- ✅ **Dead Code Analysis**: Runs Knip to detect unused code

### TypeScript Files (*.ts)
- ✅ **Type Checking**: Validates TypeScript types without emitting files

### Configuration Files (*.json, *.md, *.yaml, *.yml)
- ✅ **Prettier**: Formats configuration and documentation files

### Security Scanning
- 🔐 **Secret Detection**: Scans for potential secrets in staged files
- 📦 **Dependency Audit**: Checks for security vulnerabilities when package.json changes
- 🔒 **Lock File Security**: Runs security audit when pnpm-lock.yaml changes

## Commit Message Hook

Validates that commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format
```
type(scope): description
```

### Supported Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

### Examples
```bash
feat(auth): add user authentication
fix(api): resolve memory leak in data processing
docs: update installation instructions
ci(husky): add pre-commit hooks
```

## Pre-push Hook

The pre-push hook behavior depends on the target branch:

### Protected Branches (main, develop)
- 🛡️ **Comprehensive Validation**: Runs `pnpm validate:all:strict`
- 🧪 **Full Test Suite**: Executes all tests with `pnpm test:all`
- 🔍 **Security Checks**: Includes dependency audit and security validation
- 📊 **Dead Code Analysis**: Full Knip analysis
- 🎯 **Type Checking**: Complete TypeScript validation

### Feature Branches
- 📋 **Quick Validation**: Runs `pnpm validate:mock`
- ⚡ **Fast Feedback**: Lightweight checks for rapid development

## Bypassing Hooks (Emergency Only)

In emergency situations, you can bypass hooks with:

```bash
# Skip pre-commit hooks
git commit --no-verify -m "emergency fix"

# Skip pre-push hooks
git push --no-verify
```

**⚠️ Warning**: Only use `--no-verify` in true emergencies. All bypassed checks should be addressed immediately after the emergency deployment.

## Available Scripts

From the infrastructure directory:

```bash
# Run pre-commit checks manually
pnpm pre-commit

# Run type checking
pnpm type-check

# Run security audit
pnpm security:audit

# Run all validation
pnpm validate:all

# Run strict validation (includes all checks)
pnpm validate:all:strict
```

## Troubleshooting

### Common Issues

1. **Type errors**: Fix TypeScript compilation errors
2. **Linting errors**: Run `pnpm lint:fix` to auto-fix
3. **Formatting issues**: Run `pnpm format` to format all files
4. **Security vulnerabilities**: Update dependencies or add to audit ignore
5. **Dead code detection**: Remove unused exports or add to knip ignore

### Performance Optimization

The hooks are optimized for performance:
- **Parallel execution** where possible
- **Staged files only** for pre-commit
- **Incremental checks** for type checking
- **Cached results** where supported

### Customization

To modify the hooks, edit the files in `.husky/` directory:
- `.husky/pre-commit`
- `.husky/commit-msg`
- `.husky/pre-push`

To modify lint-staged configuration, edit the `lint-staged` section in `infrastructure/package.json`.

## Best Practices

1. **Commit early and often** - hooks catch issues sooner
2. **Use conventional commits** - improves changelog generation
3. **Fix issues locally** - don't rely on CI to catch basic problems
4. **Keep commits atomic** - one logical change per commit
5. **Write descriptive commit messages** - helps with code review and debugging

## Integration with CI/CD

These hooks complement the CI/CD pipeline by:
- Catching issues before they reach remote repository
- Reducing CI/CD failures and resource usage
- Providing immediate feedback to developers
- Maintaining consistent code quality standards

The same checks run in CI/CD to ensure consistency across all environments.
